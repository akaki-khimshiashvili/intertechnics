import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  API_URL,
  ApiError,
  createMachine,
  getMachineFilters,
  updateMachine,
  uploadImage,
  type Machine,
  type MachineInput,
  type Spec,
} from '../../lib/api'
import { ComboSelect } from '../../components/ComboSelect'
import { showToast } from '../../components/Toast'
import './MachineForm.css'

const CURRENT_YEAR = new Date().getFullYear()
// Descending list from next year (for incoming stock) down to 1980.
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1978 }, (_, i) => CURRENT_YEAR + 1 - i)

// Already uploaded (editing an existing machine) vs. picked in this session
// but not yet sent anywhere — nothing hits /uploads/image until submit.
type PhotoItem = { kind: 'existing'; url: string } | { kind: 'pending'; file: File; previewUrl: string }

function photoSrc(item: PhotoItem): string {
  return item.kind === 'existing' ? `${API_URL}${item.url}` : item.previewUrl
}

async function resolvePhoto(item: PhotoItem): Promise<string> {
  return item.kind === 'existing' ? item.url : uploadImage(item.file)
}

type FormState = {
  name: string
  name_en: string
  brand: string
  category: string
  model: string
  year: string
  condition_status: 'new' | 'used'
  status: Machine['status']
  featured: boolean
  price: string
  currency: string
  price_negotiable: boolean
  engine: string
  power_hp: string
  operating_weight_kg: string
  load_capacity_kg: string
  lift_height_m: string
  working_hours: string
  fuel_type: string
  cabin: string
  warranty: string
  description: string
  description_en: string
  meta_title: string
  meta_description: string
}

const emptyForm: FormState = {
  name: '',
  name_en: '',
  brand: '',
  category: '',
  model: '',
  year: '',
  condition_status: 'new',
  status: 'available',
  featured: false,
  price: '',
  currency: 'USD',
  price_negotiable: false,
  engine: '',
  power_hp: '',
  operating_weight_kg: '',
  load_capacity_kg: '',
  lift_height_m: '',
  working_hours: '',
  fuel_type: '',
  cabin: '',
  warranty: '',
  description: '',
  description_en: '',
  meta_title: '',
  meta_description: '',
}

function formStateFromMachine(machine: Machine | undefined): FormState {
  if (!machine) return emptyForm
  return {
    name: machine.name,
    name_en: machine.name_en ?? '',
    brand: machine.brand ?? '',
    category: machine.category ?? '',
    model: machine.model ?? '',
    year: machine.year?.toString() ?? '',
    condition_status: machine.condition_status,
    status: machine.status,
    featured: machine.featured,
    price: machine.price?.toString() ?? '',
    currency: machine.currency,
    price_negotiable: machine.price_negotiable,
    engine: machine.engine ?? '',
    power_hp: machine.power_hp?.toString() ?? '',
    operating_weight_kg: machine.operating_weight_kg?.toString() ?? '',
    load_capacity_kg: machine.load_capacity_kg?.toString() ?? '',
    lift_height_m: machine.lift_height_m?.toString() ?? '',
    working_hours: machine.working_hours?.toString() ?? '',
    fuel_type: machine.fuel_type ?? '',
    cabin: machine.cabin ?? '',
    warranty: machine.warranty ?? '',
    description: machine.description ?? '',
    description_en: machine.description_en ?? '',
    meta_title: machine.meta_title ?? '',
    meta_description: machine.meta_description ?? '',
  }
}

function toNumberOrNull(value: string): number | null {
  const trimmed = value.trim()
  if (trimmed === '') return null
  const num = Number(trimmed)
  return Number.isFinite(num) ? num : null
}

type MachineFormProps = { machine?: Machine }

export function MachineForm({ machine }: MachineFormProps = {}) {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(() => formStateFromMachine(machine))
  const [mainPhoto, setMainPhoto] = useState<PhotoItem | null>(() =>
    machine?.main_image ? { kind: 'existing', url: machine.main_image } : null,
  )
  const [gallery, setGallery] = useState<PhotoItem[]>(() =>
    (machine?.images ?? []).map((url): PhotoItem => ({ kind: 'existing', url })),
  )
  const [specs, setSpecs] = useState<Spec[]>(() => machine?.specs ?? [])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [knownBrands, setKnownBrands] = useState<string[]>([])
  const [knownCategories, setKnownCategories] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const nameInputRef = useRef<HTMLInputElement>(null)

  const objectUrls = useRef<string[]>([])
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  useEffect(() => {
    getMachineFilters()
      .then((filters) => {
        setKnownBrands(filters.brands)
        setKnownCategories(filters.categories)
      })
      .catch(() => {
        // Non-critical — the combo boxes just fall back to free-text entry.
      })
  }, [])

  function field<K extends keyof FormState>(key: K) {
    return {
      value: form[key] as string,
      onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [key]: e.target.value }) as FormState)
        setFieldErrors((prev) => {
          if (!prev[key]) return prev
          const next = { ...prev }
          delete next[key]
          return next
        })
      },
    }
  }

  function validate(): Partial<Record<keyof FormState, string>> {
    const errors: Partial<Record<keyof FormState, string>> = {}
    if (form.name.trim() === '') {
      errors.name = 'ეს ველი სავალდებულოა — გთხოვთ შეავსოთ'
    }
    return errors
  }

  function handleMainPhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (mainPhoto?.kind === 'pending') URL.revokeObjectURL(mainPhoto.previewUrl)
    const previewUrl = URL.createObjectURL(file)
    objectUrls.current.push(previewUrl)
    setMainPhoto({ kind: 'pending', file, previewUrl })
  }

  function removeMainPhoto() {
    if (mainPhoto?.kind === 'pending') URL.revokeObjectURL(mainPhoto.previewUrl)
    setMainPhoto(null)
  }

  function handleGalleryChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    const items: PhotoItem[] = files.map((file) => {
      const previewUrl = URL.createObjectURL(file)
      objectUrls.current.push(previewUrl)
      return { kind: 'pending', file, previewUrl }
    })
    setGallery((prev) => [...prev, ...items])
  }

  function removeGalleryItem(index: number) {
    setGallery((prev) => {
      const item = prev[index]
      if (item?.kind === 'pending') URL.revokeObjectURL(item.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  function addSpecRow() {
    setSpecs((prev) => [...prev, { label: '', value: '' }])
  }

  function updateSpecRow(index: number, field: keyof Spec, value: string) {
    setSpecs((prev) => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)))
  }

  function removeSpecRow(index: number) {
    setSpecs((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('გთხოვთ შეავსოთ ყველა სავალდებულო ველი')
      nameInputRef.current?.focus()
      nameInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setFieldErrors({})
    setIsSubmitting(true)
    try {
      const mainImageUrl = mainPhoto ? await resolvePhoto(mainPhoto) : null
      const galleryUrls = await Promise.all(gallery.map(resolvePhoto))
      const cleanSpecs = specs.filter((s) => s.label.trim() !== '' && s.value.trim() !== '')

      const payload: Partial<MachineInput> = {
        name: form.name.trim(),
        name_en: form.name_en.trim() || null,
        brand: form.brand.trim() || null,
        category: form.category.trim() || null,
        model: form.model.trim() || null,
        year: toNumberOrNull(form.year),
        condition_status: form.condition_status,
        status: form.status,
        featured: form.featured,
        price: toNumberOrNull(form.price),
        currency: form.currency.trim() || 'USD',
        price_negotiable: form.price_negotiable,
        engine: form.engine.trim() || null,
        power_hp: toNumberOrNull(form.power_hp),
        operating_weight_kg: toNumberOrNull(form.operating_weight_kg),
        load_capacity_kg: toNumberOrNull(form.load_capacity_kg),
        lift_height_m: toNumberOrNull(form.lift_height_m),
        working_hours: toNumberOrNull(form.working_hours),
        fuel_type: form.fuel_type.trim() || null,
        cabin: form.cabin.trim() || null,
        warranty: form.warranty.trim() || null,
        description: form.description.trim() || null,
        description_en: form.description_en.trim() || null,
        specs: cleanSpecs,
        main_image: mainImageUrl,
        images: galleryUrls,
        meta_title: form.meta_title.trim() || null,
        meta_description: form.meta_description.trim() || null,
      }

      if (machine) {
        const updated = await updateMachine(machine.id, payload)
        showToast(`„${updated.name}“ წარმატებით განახლდა`, 'success')
      } else {
        const created = await createMachine(payload)
        showToast(`„${created.name}“ წარმატებით დაემატა`, 'success')
        navigate(`/machines/${created.id}/edit`, { replace: true })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'დაფიქსირდა შეცდომა, სცადეთ თავიდან')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="machine-form" onSubmit={handleSubmit} noValidate>
      <section className="machine-form-section">
        <h2>ძირითადი ინფორმაცია</h2>
        <div className="machine-form-grid">
          <label className={`machine-field${fieldErrors.name ? ' machine-field-invalid' : ''}`}>
            <span>დასახელება *</span>
            <input type="text" {...field('name')} ref={nameInputRef} aria-invalid={Boolean(fieldErrors.name)} />
            {fieldErrors.name && <span className="machine-field-error">{fieldErrors.name}</span>}
          </label>
          <label className="machine-field">
            <span>დასახელება (ინგლისურად)</span>
            <input type="text" {...field('name_en')} />
          </label>
          <label className="machine-field">
            <span>ბრენდი</span>
            <ComboSelect
              value={form.brand}
              options={knownBrands}
              onChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}
              placeholder="Bobcat, Kubota, AMMANN..."
              addNewLabel="+ ახალი ბრენდის დამატება..."
            />
          </label>
          <label className="machine-field">
            <span>კატეგორია</span>
            <ComboSelect
              value={form.category}
              options={knownCategories}
              onChange={(value) => setForm((prev) => ({ ...prev, category: value }))}
              placeholder="მინი დამტვირთველები, კომპრესორები..."
              addNewLabel="+ ახალი კატეგორიის დამატება..."
            />
          </label>
          <label className="machine-field">
            <span>მოდელი</span>
            <input type="text" {...field('model')} />
          </label>
          <label className="machine-field">
            <span>წელი</span>
            <select {...field('year')}>
              <option value="">არჩეული არაა</option>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="machine-field">
            <span>მდგომარეობა</span>
            <select {...field('condition_status')}>
              <option value="new">ახალი</option>
              <option value="used">მეორადი</option>
            </select>
          </label>
          <label className="machine-field">
            <span>სტატუსი</span>
            <select {...field('status')}>
              <option value="available">ხელმისაწვდომი</option>
              <option value="reserved">დაჯავშნილი</option>
              <option value="sold">გაყიდული</option>
            </select>
          </label>
        </div>
        <label className="machine-checkbox">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
          />
          <span>გამორჩეული (გამოჩნდეს მთავარ გვერდზე)</span>
        </label>
      </section>

      <section className="machine-form-section">
        <h2>ფასი</h2>
        <div className="machine-form-grid">
          <label className="machine-field">
            <span>ფასი</span>
            <input type="number" min="0" step="0.01" {...field('price')} placeholder="დატოვეთ ცარიელი, თუ არ ეხება" />
          </label>
          <label className="machine-field">
            <span>ვალუტა</span>
            <select {...field('currency')}>
              <option value="USD">USD</option>
              <option value="GEL">GEL</option>
              <option value="EUR">EUR</option>
            </select>
          </label>
        </div>
        <label className="machine-checkbox">
          <input
            type="checkbox"
            checked={form.price_negotiable}
            onChange={(e) => setForm((prev) => ({ ...prev, price_negotiable: e.target.checked }))}
          />
          <span>ფასი შეთანხმებადია</span>
        </label>
      </section>

      <section className="machine-form-section">
        <h2>ტექნიკური მახასიათებლები</h2>
        <p className="machine-form-hint">ყველა ველი არჩევითია — შეავსეთ მხოლოდ ის, რაც ამ ტექნიკას შეეხება.</p>
        <div className="machine-form-grid">
          <label className="machine-field">
            <span>ძრავი</span>
            <input type="text" {...field('engine')} placeholder="Kubota / 4 cyl / Diesel" />
          </label>
          <label className="machine-field">
            <span>სიმძლავრე (ცხ.ძ.)</span>
            <input type="number" min="0" step="0.1" {...field('power_hp')} />
          </label>
          <label className="machine-field">
            <span>წონა (კგ)</span>
            <input type="number" min="0" step="0.1" {...field('operating_weight_kg')} />
          </label>
          <label className="machine-field">
            <span>ტვირთამწეობა (კგ)</span>
            <input type="number" min="0" step="0.1" {...field('load_capacity_kg')} />
          </label>
          <label className="machine-field">
            <span>აწევის სიმაღლე (მ)</span>
            <input type="number" min="0" step="0.1" {...field('lift_height_m')} />
          </label>
          <label className="machine-field">
            <span>საწვავის ტიპი</span>
            <input type="text" {...field('fuel_type')} placeholder="დიზელი, ბენზინი..." />
          </label>
          <label className="machine-field">
            <span>ნამუშევარი საათები</span>
            <input type="number" min="0" {...field('working_hours')} />
          </label>
          <label className="machine-field">
            <span>კაბინა</span>
            <input type="text" {...field('cabin')} placeholder="გათბობა/კონდიცირებით" />
          </label>
          <label className="machine-field">
            <span>გარანტია</span>
            <input type="text" {...field('warranty')} placeholder="2 წელი / 2000 სთ" />
          </label>
        </div>
      </section>

      <section className="machine-form-section">
        <h2>დამატებითი მახასიათებლები</h2>
        <p className="machine-form-hint">
          ველები, რომლებიც ზემოთ არ არის — მაგ. „წარმადობა: 120 ტ/სთ" ასფალტის ქარხნისთვის.
        </p>
        <div className="specs-editor">
          {specs.map((spec, index) => (
            <div className="specs-row" key={index}>
              <input
                type="text"
                placeholder="დასახელება"
                value={spec.label}
                onChange={(e) => updateSpecRow(index, 'label', e.target.value)}
              />
              <input
                type="text"
                placeholder="მნიშვნელობა"
                value={spec.value}
                onChange={(e) => updateSpecRow(index, 'value', e.target.value)}
              />
              <button type="button" className="specs-row-remove" onClick={() => removeSpecRow(index)}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="specs-add-btn" onClick={addSpecRow}>
            + მახასიათებლის დამატება
          </button>
        </div>
      </section>

      <section className="machine-form-section">
        <h2>აღწერა</h2>
        <label className="machine-field">
          <span>აღწერა</span>
          <textarea rows={5} {...field('description')} />
        </label>
        <label className="machine-field">
          <span>აღწერა (ინგლისურად)</span>
          <textarea rows={5} {...field('description_en')} />
        </label>
      </section>

      <section className="machine-form-section">
        <h2>სურათები</h2>
        <div className="machine-field">
          <span>მთავარი სურათი</span>
          {mainPhoto && (
            <div className="photo-preview">
              <img src={photoSrc(mainPhoto)} alt="" />
              <button type="button" className="photo-remove" onClick={removeMainPhoto}>
                წაშლა
              </button>
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleMainPhotoChange} />
        </div>

        <div className="machine-field">
          <span>დამატებითი სურათები (გალერეა)</span>
          <div className="photos-grid">
            {gallery.map((item, index) => (
              <div className="photo-thumb" key={index}>
                <img src={photoSrc(item)} alt="" />
                <button type="button" className="photo-remove" onClick={() => removeGalleryItem(index)}>
                  წაშლა
                </button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={handleGalleryChange} />
        </div>
      </section>

      <section className="machine-form-section">
        <h2>SEO</h2>
        <p className="machine-form-hint">
          ეს ტექსტი გამოჩნდება Google-ის ძებნის შედეგებში. ცარიელი რჩება, თუ არაფერს შეავსებთ — მაშინ ავტომატურად
          გამოიყენება დასახელება და აღწერა.
        </p>
        <label className="machine-field">
          <span>Meta სათაური</span>
          <input
            type="text"
            {...field('meta_title')}
            maxLength={70}
            placeholder={`${form.name || 'Bobcat S630'} — ${form.brand || 'Bobcat'} ${
              form.condition_status === 'used' ? 'მეორადი' : 'ახალი'
            } | Intertechnics`}
          />
          <span className="machine-field-hint">
            მაგალითი: „{form.name || 'Bobcat S630'} იყიდება თბილისში საუკეთესო ფასად | Intertechnics“ — ოპტიმალური
            სიგრძეა 50–60 სიმბოლო ({form.meta_title.length}/60)
          </span>
        </label>
        <label className="machine-field">
          <span>Meta აღწერა</span>
          <textarea
            rows={2}
            {...field('meta_description')}
            maxLength={170}
            placeholder={`${form.brand || 'Bobcat'} ${form.name || 'S630'} — ${
              form.condition_status === 'used' ? 'მეორადი' : 'ახალი'
            } ტექნიკა გარანტიით. დაგვიკავშირდით ფასისა და მიწოდების დეტალებისთვის.`}
          />
          <span className="machine-field-hint">
            მაგალითი: „{form.brand || 'Bobcat'} {form.name || 'S630'} საუკეთესო ფასად, გარანტიით და მიწოდებით
            თბილისში“ — ოპტიმალური სიგრძეა 150–160 სიმბოლო ({form.meta_description.length}/160)
          </span>
        </label>
      </section>

      {error && <p className="machine-form-error">{error}</p>}

      <button type="submit" className="machine-form-submit" disabled={isSubmitting}>
        {isSubmitting ? 'ინახება...' : machine ? 'ცვლილებების შენახვა' : 'ტექნიკის დამატება'}
      </button>
    </form>
  )
}
