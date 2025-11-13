import { CreatePromoCodeForm } from './CreatePromoCodeForm'

export const metadata = {
  title: 'Create Promo Code - Admin',
}

export default function NewPromoCodePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Promo Code</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create a new promotional code with custom limits and features
        </p>
      </div>

      <CreatePromoCodeForm />
    </div>
  )
}
