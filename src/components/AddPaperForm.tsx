import { useState } from 'react'
import { supabase } from '../supabaseClient'

export function AddPaperForm({ onPaperAdded }: { onPaperAdded: () => void }) {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    // وەرگرتنا یوزەرێ نوکە لۆگین بووی
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg('تکایە پێشتر بچە ژوورڤە!')
      setLoading(false)
      return
    }

    // زێدەکرنا داتایێ بۆ خشتەیا papers ب ڕێکا INSERT
    const { error } = await supabase.from('papers').insert([
      { 
        title: title, 
        user_id: user.id 
      }
    ])

    if (error) {
      setErrorMsg(error.message)
    } else {
      setTitle('')
      onPaperAdded() // بۆ نووژەنکرنا لیستی
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-md space-y-4">
      <h3 className="text-lg font-bold text-gray-800">زێدەکرنا لێکۆلین یان فایلەکێ نوو</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">ناڤێ لێکۆلینێ (Title)</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          placeholder="ناڤێ بابەتێ زانستی..."
        />
      </div>
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
      >
        {loading ? 'خەریکە لێ زێدەبکەت...' : 'زێدەکرنا لێکۆلینێ'}
      </button>
    </form>
  )
}
