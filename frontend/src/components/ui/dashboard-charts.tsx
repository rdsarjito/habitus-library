'use client'

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = {
  maroon: '#8d1231',
  emerald: '#059669',
  amber: '#d97706',
  red: '#dc2626',
  slate: '#cbd5e1',
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill?: string } }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-lg px-3 py-2">
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.payload.fill || COLORS.maroon }} />
          <span>{p.name}:</span>
          <span className="text-slate-900">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function CustomLegend({ payload }: { payload?: Array<{ value: string; color: string }> }) {
  if (!payload) return null
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </div>
      ))}
    </div>
  )
}

export function BookStockChart({ books }: { books: { totalCopies: number; availableCopies: number } }) {
  const borrowed = books.totalCopies - books.availableCopies
  const data = [
    { name: 'Tersedia', value: books.availableCopies, fill: COLORS.emerald },
    { name: 'Dipinjam', value: borrowed, fill: COLORS.maroon },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Stok Eksemplar</h3>
        <span className="text-[11px] font-bold text-slate-300">Total: {books.totalCopies}</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
            {data.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-1">
        <div className="text-center">
          <p className="text-2xl font-black text-emerald-600">{books.availableCopies}</p>
          <p className="text-[10px] font-bold text-slate-400">Tersedia</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-[#8d1231]">{borrowed}</p>
          <p className="text-[10px] font-bold text-slate-400">Dipinjam</p>
        </div>
      </div>
    </div>
  )
}

export function MemberStatusChart({ members }: { members: { total: number; active: number; inactive: number } }) {
  const data = [
    { name: 'Aktif', value: members.active, fill: COLORS.emerald },
    { name: 'Nonaktif', value: members.inactive, fill: COLORS.slate },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Status Anggota</h3>
        <span className="text-[11px] font-bold text-slate-300">Total: {members.total}</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" strokeWidth={0}>
            {data.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-1">
        <div className="text-center">
          <p className="text-2xl font-black text-emerald-600">{members.active}</p>
          <p className="text-[10px] font-bold text-slate-400">Aktif</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-slate-400">{members.inactive}</p>
          <p className="text-[10px] font-bold text-slate-400">Nonaktif</p>
        </div>
      </div>
    </div>
  )
}

export function LoanStatusChart({ loans }: { loans: { total: number; active: number; overdue: number; returned: number } }) {
  const data = [
    { name: 'Aktif', value: loans.active, fill: COLORS.amber },
    { name: 'Terlambat', value: loans.overdue, fill: COLORS.red },
    { name: 'Dikembalikan', value: loans.returned, fill: COLORS.emerald },
  ]

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm lg:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Statistik Peminjaman</h3>
        <span className="text-[11px] font-bold text-slate-300">Total: {loans.total} transaksi</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="25%" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: '#cbd5e1' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(141, 18, 49, 0.04)' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => (<Cell key={i} fill={entry.fill} />))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-5 mt-1">
        <div className="text-center">
          <p className="text-xl font-black text-amber-600">{loans.active}</p>
          <p className="text-[10px] font-bold text-slate-400">Aktif</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-black text-red-600">{loans.overdue}</p>
          <p className="text-[10px] font-bold text-slate-400">Terlambat</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-black text-emerald-600">{loans.returned}</p>
          <p className="text-[10px] font-bold text-slate-400">Selesai</p>
        </div>
      </div>
    </div>
  )
}
