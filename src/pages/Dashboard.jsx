import React, { useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LabelList
} from 'recharts';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1GIEPXnjsjw7RClGwgOFVOrZemhlqY7jAMl7t2FNkvos/export?format=csv';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#10b981', '#f43f5e', '#3b82f6'];

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(null); // { key, direction: 'asc' | 'desc' }
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const [metrics, setMetrics] = useState({
    age: [],
    gender: [],
    prasadam: [],
    languages: [],
    seating: [],
    chanting: [],
    accommodation: []
  });

  const fetchData = () => {
    setLoading(true);
    fetch(GOOGLE_SHEET_CSV_URL)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedData = results.data;
            let globalIndex = 1;
            let currentDev = '';
            let currentPhone = '';
            const validData = parsedData.filter(row => row['Individual Name'] && row['Age']).map(row => {
              if (row['Devotee Name'] && row['Devotee Name'].trim() !== '') {
                currentDev = row['Devotee Name'].trim();
                currentPhone = row['WhatsApp Number']?.trim() || '';
              }
              return {
                ...row,
                groupDevoteeName: currentDev,
                groupWhatsapp: currentPhone,
                globalIndex: globalIndex++
              };
            });
            setData(validData);
            aggregateMetrics(validData);
            setLastRefreshed(new Date());
            setLoading(false);
          }
        });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const aggregateMetrics = (validData) => {
    // 1. Age
    const ageBuckets = {
      '0-5': 0, '6-18': 0, '19-30': 0, '31-40': 0, '41-50': 0, '51-60': 0, '60+': 0
    };
    const genderCounts = {};
    const prasadamCounts = {};
    const langCounts = { Hindi: 0, English: 0, Telugu: 0 };
    const seatingCounts = {};
    const chantingCounts = {};
    const accommCounts = {};

    validData.forEach(row => {
      // Age
      const ageStr = row['Age'] || '';
      const age = parseInt(ageStr, 10);
      if (!isNaN(age)) {
        if (age <= 5) ageBuckets['0-5']++;
        else if (age <= 18) ageBuckets['6-18']++;
        else if (age <= 30) ageBuckets['19-30']++;
        else if (age <= 40) ageBuckets['31-40']++;
        else if (age <= 50) ageBuckets['41-50']++;
        else if (age <= 60) ageBuckets['51-60']++;
        else ageBuckets['60+']++;
      }

      // Gender
      const gender = row['Gender']?.trim() || 'Unknown';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;

      // Prasadam
      const prasadam = row['Prasadam Output']?.trim() || 'Unknown';
      prasadamCounts[prasadam] = (prasadamCounts[prasadam] || 0) + 1;

      // Languages
      const langs = row['Languages']?.split(',') || [];
      langs.forEach(l => {
        const t = l.trim();
        if (t === 'Hindi') langCounts.Hindi++;
        if (t === 'English') langCounts.English++;
        if (t === 'Telugu') langCounts.Telugu++;
      });

      // Seating
      const seating = row['Seating']?.trim() || 'Can sit below';
      seatingCounts[seating] = (seatingCounts[seating] || 0) + 1;

      // Chanting
      const chantingRaw = row['Chanting']?.trim();
      const chanting = chantingRaw === undefined || chantingRaw === '' ? 'Blank' : chantingRaw;
      chantingCounts[chanting] = (chantingCounts[chanting] || 0) + 1;

      // Accommodation
      const accomm = row['Accommodation']?.trim() || 'Unknown';
      accommCounts[accomm] = (accommCounts[accomm] || 0) + 1;
    });

    const standardChanting = ['0', '1+', '4+', '8+', '16'];
    standardChanting.forEach(c => {
      if (chantingCounts[c] === undefined) chantingCounts[c] = 0;
    });

    const sortedChantingKeys = Object.keys(chantingCounts).sort((a, b) => {
      if (a === 'Blank' || a === 'Not specified') return -1;
      if (b === 'Blank' || b === 'Not specified') return 1;
      return parseInt(a.replace('+', '')) - parseInt(b.replace('+', ''));
    });

    setMetrics({
      age: Object.keys(ageBuckets).map(key => ({ name: key, value: ageBuckets[key] })),
      gender: Object.keys(genderCounts).map(key => ({ name: key, value: genderCounts[key] })),
      prasadam: Object.keys(prasadamCounts).map(key => ({ name: key, value: prasadamCounts[key] })),
      languages: Object.keys(langCounts).map(key => ({ name: key, value: langCounts[key] })),
      seating: Object.keys(seatingCounts).map(key => ({ name: key, value: seatingCounts[key] })),
      chanting: sortedChantingKeys.map(key => ({ name: key, value: chantingCounts[key] })),
      accommodation: Object.keys(accommCounts).map(key => ({ name: key, value: accommCounts[key] }))
    });
  };

  const processedData = useMemo(() => {
    let filtered = data;

    // Apply Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(row => 
        (row.groupDevoteeName?.toLowerCase().includes(lowerTerm)) ||
        (row['Individual Name']?.toLowerCase().includes(lowerTerm)) ||
        (row.groupWhatsapp?.includes(searchTerm))
      );
    }

    // Apply Sort
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let valA = (sortConfig.key === 'Devotee Name' ? a.groupDevoteeName : (sortConfig.key === 'WhatsApp Number' ? a.groupWhatsapp : a[sortConfig.key])) || '';
        let valB = (sortConfig.key === 'Devotee Name' ? b.groupDevoteeName : (sortConfig.key === 'WhatsApp Number' ? b.groupWhatsapp : b[sortConfig.key])) || '';
        
        if (sortConfig.key === 'globalIndex' || sortConfig.key === 'Age') {
           valA = parseInt(valA) || 0;
           valB = parseInt(valB) || 0;
        } else if (sortConfig.key === 'Chanting') {
           valA = parseInt(valA.toString().replace('+', '')) || 0;
           valB = parseInt(valB.toString().replace('+', '')) || 0;
        } else {
           valA = valA.toString().toLowerCase();
           valB = valB.toString().toLowerCase();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig]);

  const kpis = useMemo(() => {
    const uniqueGroups = new Set(data.filter(d => d['Devotee Name']).map(d => d['Devotee Name']));
    return {
      groups: uniqueGroups.size,
      total: data.length
    };
  }, [data]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const resetSort = () => setSortConfig(null);

  const exportCSV = () => {
    const exportData = processedData.map(row => {
      const { groupDevoteeName, groupWhatsapp, globalIndex, ...rest } = row;
      return rest;
    });
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'yatra_filtered_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDevoteeRowSpan = (idx, list) => {
    const currentName = list[idx].groupDevoteeName;
    if (idx > 0 && list[idx - 1].groupDevoteeName === currentName) {
      return 0; // Don't render td
    }
    let span = 1;
    while (idx + span < list.length && list[idx + span].groupDevoteeName === currentName) {
      span++;
    }
    return span;
  };

  const getBadgeClass = (val) => {
    if (!val || val === '-' || val === 'Unknown' || val === 'Not specified') return 'bg-slate-100 text-slate-700';
    
    const lowerVal = String(val).toLowerCase();
    if (lowerVal.includes('telugu')) return 'bg-orange-100 text-orange-800 border border-orange-200';
    if (lowerVal.includes('english')) return 'bg-blue-100 text-blue-800 border border-blue-200';
    if (lowerVal.includes('hindi')) return 'bg-green-100 text-green-800 border border-green-200';

    if (val === '0') return 'bg-gray-100 text-gray-700 border border-gray-200';
    if (val === '1+') return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    if (val === '4+') return 'bg-amber-100 text-amber-800 border border-amber-200';
    if (val === '8+') return 'bg-lime-100 text-lime-800 border border-lime-200';
    if (val === '16') return 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300';

    const colors = [
      'bg-indigo-100 text-indigo-700',
      'bg-emerald-100 text-emerald-700',
      'bg-amber-100 text-amber-700',
      'bg-rose-100 text-rose-700',
      'bg-cyan-100 text-cyan-700',
      'bg-violet-100 text-violet-700',
      'bg-fuchsia-100 text-fuchsia-700',
    ];
    let hash = 0;
    const str = String(val);
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent === 0) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {value}
      </text>
    );
  };

  const renderSortableHeader = (label, sortKey, minWidth, maxWidth, isSticky, stickyLeft) => {
    return (
      <th 
        className={`px-4 py-3 font-semibold border border-slate-300 outline outline-1 outline-slate-300 whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors ${isSticky ? 'sticky z-30 bg-slate-100' : ''}`}
        style={{ minWidth, maxWidth, left: stickyLeft }}
        onClick={() => requestSort(sortKey)}
      >
        <div className="flex items-center gap-2 justify-between">
          <span>{label}</span>
          <span className="text-slate-400 text-xs font-bold">
            {sortConfig?.key === sortKey ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
          </span>
        </div>
      </th>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <img src="/assets/GNHLogo.png" alt="GNH Logo" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Yatra Analytics</h1>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            <div className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full hidden sm:block">
              Total Devotees: <span className="text-indigo-600 font-bold">{data.length}</span>
            </div>
            <div className="text-xs text-slate-400 text-right">
              Updated: <br/>{lastRefreshed.toLocaleTimeString()}
            </div>
            <button onClick={fetchData} className="text-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm border border-indigo-100">
              <span>↻ Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <span className="text-sm text-slate-500 font-medium">Families / Groups</span>
            <span className="text-2xl font-bold text-slate-800">{kpis.groups}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <span className="text-sm text-slate-500 font-medium">Total Registrations</span>
            <span className="text-2xl font-bold text-rose-600">{kpis.total}</span>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <span className="text-sm text-slate-500 font-medium">Currently Showing</span>
            <span className="text-2xl font-bold text-indigo-600">{processedData.length}</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Age Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Age Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.age} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="value" position="top" fill="#64748b" fontSize={12} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gender */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Gender</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.gender} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                    {metrics.gender.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Prasadam */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Prasadam Output</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.prasadam} cx="50%" cy="50%" innerRadius={0} outerRadius={90} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                    {metrics.prasadam.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Languages Spoken</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.languages} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                    {metrics.languages.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Seating */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Seating Preference</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.seating} cx="50%" cy="50%" innerRadius={0} outerRadius={90} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                    {metrics.seating.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Accommodation */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Accommodation</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={metrics.accommodation} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                    {metrics.accommodation.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chanting */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow lg:col-span-3">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Chanting Rounds</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.chanting} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="value" position="top" fill="#64748b" fontSize={12} fontWeight="bold" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Data Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          
          {/* Table Toolbar */}
          <div className="px-6 py-5 border-b border-slate-200 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-slate-800 whitespace-nowrap">Devotee Entries</h3>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <input 
                    type="text" 
                    placeholder="Search name or number..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      ✕
                    </button>
                  )}
                </div>
                {sortConfig && (
                  <button onClick={resetSort} className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg whitespace-nowrap transition-colors border border-slate-200">
                    Reset Sort
                  </button>
                )}
                <button onClick={exportCSV} className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg whitespace-nowrap transition-colors shadow-sm">
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-auto max-h-[600px] relative">
            <table className="w-full text-sm text-left border-separate border-spacing-0 border border-slate-300">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0 z-20 shadow-sm border-b border-slate-300">
                <tr>
                  {renderSortableHeader('Sl No.', 'globalIndex', '60px', '60px', true, '0')}
                  {renderSortableHeader('Devotee Name', 'Devotee Name', '180px', '180px', true, '60px')}
                  {renderSortableHeader('Indiv. Name', 'Individual Name', '180px', '180px', true, '240px')}
                  {renderSortableHeader('Age', 'Age')}
                  {renderSortableHeader('Gender', 'Gender')}
                  {renderSortableHeader('WhatsApp', 'WhatsApp Number')}
                  {renderSortableHeader('Relation', 'Relationship')}
                  {renderSortableHeader('Prasadam', 'Prasadam Output')}
                  {renderSortableHeader('Languages', 'Languages')}
                  {renderSortableHeader('Seating', 'Seating')}
                  {renderSortableHeader('Chanting', 'Chanting')}
                  {renderSortableHeader('Spirit. Status', 'Spiritual Status')}
                  {renderSortableHeader('Accom.', 'Accommodation')}
                  {renderSortableHeader('Concerns', 'Concerns')}
                </tr>
              </thead>
              <tbody>
                {processedData.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="px-6 py-8 text-center text-slate-500 font-medium border border-slate-300 outline outline-1 outline-slate-300">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  processedData.map((row, index) => {
                    const devRowSpan = getDevoteeRowSpan(index, processedData);
                    return (
                      <tr key={`${row.globalIndex}`} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700 text-center border border-slate-300 outline outline-1 outline-slate-300 sticky left-0 z-10 bg-slate-50">
                          {row.globalIndex}
                        </td>
                        {devRowSpan > 0 && (
                          <td rowSpan={devRowSpan} className="px-4 py-3 font-bold text-indigo-900 border border-slate-300 outline outline-1 outline-slate-300 sticky left-[60px] z-10 bg-indigo-50 truncate" style={{ minWidth: '180px', maxWidth: '180px' }} title={row.groupDevoteeName}>
                            {row.groupDevoteeName || '-'}
                          </td>
                        )}
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 font-medium text-slate-800 whitespace-nowrap sticky left-[240px] z-10 bg-white truncate" style={{ minWidth: '180px', maxWidth: '180px' }} title={row['Individual Name']}>
                          {row['Individual Name']}
                        </td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 whitespace-nowrap text-center">
                          {row['Age'] || '-'}
                        </td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${row['Gender'] === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                            {row['Gender']}
                          </span>
                        </td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 whitespace-nowrap">{row['WhatsApp Number'] || '-'}</td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 whitespace-nowrap">{row['Relationship'] || '-'}</td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(row['Prasadam Output'] || 'Unknown')}`}>
                            {row['Prasadam Output'] || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 max-w-[150px]" title={row['Languages']}>
                          <div className="flex flex-wrap gap-1">
                            {(row['Languages'] || '-').split(',').map((lang, i) => (
                              <span key={i} className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(lang.trim())}`}>
                                {lang.trim()}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(row['Seating'] || 'Can sit below')}`}>
                            {row['Seating'] || 'Can sit below'}
                          </span>
                        </td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 font-semibold whitespace-nowrap">
                          {row['Chanting']?.trim() ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(row['Chanting'])}`}>
                              {row['Chanting']}
                            </span>
                          ) : ''}
                        </td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 max-w-[150px] truncate" title={row['Spiritual Status']}>{row['Spiritual Status'] || '-'}</td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBadgeClass(row['Accommodation'] || '-')}`}>
                            {row['Accommodation'] || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 border border-slate-300 outline outline-1 outline-slate-300 text-slate-600 max-w-[200px] truncate" title={row['Concerns']}>{row['Concerns'] || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
