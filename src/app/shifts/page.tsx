'use client';

import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, subWeeks, addWeeks, parseISO, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Users,
  Plus,
  Trash2,
  Edit2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Navbar from '@/components/Navbar';

interface Employee {
  id: string;
  name: string;
  phone?: string | null;
  hourlyRate: number;
  active: boolean;
}

interface ShiftAssignment {
  id: string;
  employeeId: string;
  date: string;
  shiftType: 'MORNING' | 'AFTERNOON' | 'CUSTOM';
  startTime: string;
  endTime: string;
  actualHours: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'ABSENT';
  notes?: string | null;
  employee: Employee;
}

export default function ShiftSchedulePage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentMonthStr, setCurrentMonthStr] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'employees'>('weekly');

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<ShiftAssignment[]>([]);
  const [monthShifts, setMonthShifts] = useState<ShiftAssignment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal states
  const [showEmployeeModal, setShowEmployeeModal] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRate, setEmpRate] = useState('25000');

  const [showShiftModal, setShowShiftModal] = useState<boolean>(false);
  const [editingShift, setEditingShift] = useState<ShiftAssignment | null>(null);
  const [shiftEmpId, setShiftEmpId] = useState('');
  const [shiftDate, setShiftDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [shiftType, setShiftType] = useState<'MORNING' | 'AFTERNOON' | 'CUSTOM'>('MORNING');
  const [shiftStartTime, setShiftStartTime] = useState('07:00');
  const [shiftEndTime, setShiftEndTime] = useState('12:30');
  const [shiftActualHours, setShiftActualHours] = useState('5.5');
  const [shiftStatus, setShiftStatus] = useState<'SCHEDULED' | 'COMPLETED' | 'ABSENT'>('SCHEDULED');
  const [shiftNotes, setShiftNotes] = useState('');

  // Quick Inline Edit Hours State
  const [editingShiftHoursId, setEditingShiftHoursId] = useState<string | null>(null);
  const [quickHoursValue, setQuickHoursValue] = useState<string>('');

  // Start & End of current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchWeekShifts();
  }, [currentDate]);

  useEffect(() => {
    fetchMonthShifts();
  }, [currentMonthStr]);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
    }
  };

  const fetchWeekShifts = async () => {
    setIsLoading(true);
    try {
      const startStr = format(weekStart, 'yyyy-MM-dd');
      const endStr = format(weekEnd, 'yyyy-MM-dd');
      const res = await fetch(`/api/shifts?startDate=${startStr}&endDate=${endStr}`);
      if (res.ok) {
        const data = await res.json();
        setShifts(data);
      }
    } catch (error) {
      console.error('Failed to fetch week shifts', error);
    }
    setIsLoading(false);
  };

  const fetchMonthShifts = async () => {
    try {
      const res = await fetch(`/api/shifts?month=${currentMonthStr}`);
      if (res.ok) {
        const data = await res.json();
        setMonthShifts(data);
      }
    } catch (error) {
      console.error('Failed to fetch month shifts', error);
    }
  };

  // Preset time when changing shift type
  const handleShiftTypeChange = (type: 'MORNING' | 'AFTERNOON' | 'CUSTOM') => {
    setShiftType(type);
    if (type === 'MORNING') {
      setShiftStartTime('07:00');
      setShiftEndTime('12:30');
      setShiftActualHours('5.5');
    } else if (type === 'AFTERNOON') {
      setShiftStartTime('12:00');
      setShiftEndTime('18:30');
      setShiftActualHours('6.5');
    }
  };

  // Employee Save / Create
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    try {
      if (editingEmployee) {
        // Update
        const res = await fetch(`/api/employees/${editingEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: empName,
            phone: empPhone,
            hourlyRate: Number(empRate),
          }),
        });
        if (res.ok) {
          fetchEmployees();
          closeEmployeeModal();
        }
      } else {
        // Create
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: empName,
            phone: empPhone,
            hourlyRate: Number(empRate),
          }),
        });
        if (res.ok) {
          fetchEmployees();
          closeEmployeeModal();
        }
      }
    } catch (error) {
      console.error('Save employee error', error);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này? Lịch làm việc của nhân viên cũng sẽ bị xóa.')) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEmployees();
        fetchWeekShifts();
        fetchMonthShifts();
      }
    } catch (error) {
      console.error('Delete employee error', error);
    }
  };

  const openAddEmployeeModal = () => {
    setEditingEmployee(null);
    setEmpName('');
    setEmpPhone('');
    setEmpRate('25000');
    setShowEmployeeModal(true);
  };

  const openEditEmployeeModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setEmpName(emp.name);
    setEmpPhone(emp.phone || '');
    setEmpRate(emp.hourlyRate.toString());
    setShowEmployeeModal(true);
  };

  const closeEmployeeModal = () => {
    setShowEmployeeModal(false);
    setEditingEmployee(null);
  };

  // Shift Save / Create / Update
  const handleSaveShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftEmpId || !shiftDate) return;

    try {
      if (editingShift) {
        // Update
        const res = await fetch(`/api/shifts/${editingShift.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: shiftEmpId,
            date: shiftDate,
            shiftType,
            startTime: shiftStartTime,
            endTime: shiftEndTime,
            actualHours: Number(shiftActualHours),
            status: shiftStatus,
            notes: shiftNotes,
          }),
        });
        if (res.ok) {
          fetchWeekShifts();
          fetchMonthShifts();
          closeShiftModal();
        }
      } else {
        // Create
        const res = await fetch('/api/shifts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: shiftEmpId,
            date: shiftDate,
            shiftType,
            startTime: shiftStartTime,
            endTime: shiftEndTime,
            actualHours: Number(shiftActualHours),
            status: shiftStatus,
            notes: shiftNotes,
          }),
        });
        if (res.ok) {
          fetchWeekShifts();
          fetchMonthShifts();
          closeShiftModal();
        }
      }
    } catch (error) {
      console.error('Save shift error', error);
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa ca làm này?')) return;
    try {
      const res = await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchWeekShifts();
        fetchMonthShifts();
      }
    } catch (error) {
      console.error('Delete shift error', error);
    }
  };

  const openAddShiftModal = (dateStr?: string, defaultShiftType?: 'MORNING' | 'AFTERNOON') => {
    setEditingShift(null);
    setShiftEmpId(employees.length > 0 ? employees[0].id : '');
    setShiftDate(dateStr || format(new Date(), 'yyyy-MM-dd'));
    handleShiftTypeChange(defaultShiftType || 'MORNING');
    setShiftStatus('SCHEDULED');
    setShiftNotes('');
    setShowShiftModal(true);
  };

  const openEditShiftModal = (shift: ShiftAssignment) => {
    setEditingShift(shift);
    setShiftEmpId(shift.employeeId);
    setShiftDate(shift.date);
    setShiftType(shift.shiftType);
    setShiftStartTime(shift.startTime);
    setShiftEndTime(shift.endTime);
    setShiftActualHours(shift.actualHours.toString());
    setShiftStatus(shift.status);
    setShiftNotes(shift.notes || '');
    setShowShiftModal(true);
  };

  const closeShiftModal = () => {
    setShowShiftModal(false);
    setEditingShift(null);
  };

  // Quick Update Hours directly
  const handleQuickUpdateHours = async (shiftId: string, hoursStr: string) => {
    const numHours = parseFloat(hoursStr);
    if (isNaN(numHours)) return;

    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualHours: numHours }),
      });
      if (res.ok) {
        fetchWeekShifts();
        fetchMonthShifts();
        setEditingShiftHoursId(null);
      }
    } catch (error) {
      console.error('Error updating hours', error);
    }
  };

  // Quick Update Shift Status
  const handleQuickUpdateStatus = async (shiftId: string, status: 'SCHEDULED' | 'COMPLETED' | 'ABSENT') => {
    try {
      const res = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchWeekShifts();
        fetchMonthShifts();
      }
    } catch (error) {
      console.error('Error updating shift status', error);
    }
  };

  // Export Monthly Payroll to Excel
  const handleExportPayroll = () => {
    const payrollData = employees.map((emp) => {
      const empShifts = monthShifts.filter((s) => s.employeeId === emp.id && s.status !== 'ABSENT');
      const totalHours = empShifts.reduce((sum, s) => sum + s.actualHours, 0);
      const totalSalary = totalHours * emp.hourlyRate;
      return {
        'Mã NV': emp.id,
        'Họ và Tên': emp.name,
        'Số Điện Thoại': emp.phone || 'Chưa có',
        'Lương / Giờ (đ)': emp.hourlyRate,
        'Tổng Số Ca Làm': empShifts.length,
        'Tổng Số Giờ Thực Tế': totalHours,
        'Tổng Lương (VND)': totalSalary,
      };
    });

    const ws = XLSX.utils.json_to_sheet(payrollData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Luong_${currentMonthStr}`);
    XLSX.writeFile(wb, `Bang_Luong_Nhan_Vien_${currentMonthStr}.xlsx`);
  };

  const formatCurrency = (val: number) => val.toLocaleString('vi-VN') + ' đ';

  return (
    <div className="min-h-screen bg-[#F0FDF4] font-sans text-gray-900 pb-16">
      <Navbar />
      <div className="max-w-[1400px] mx-auto space-y-6 mt-4 p-2 sm:p-6 md:p-8 pt-0">
        
        {/* Header Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border-2 border-emerald-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-800 flex items-center gap-2">
              <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />
              <span>Quản Lý Ca Làm & Tính Lương</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
              Phân ca dự kiến (Sáng: 7h-12h30, Chiều: 12h-18h30), chỉnh sửa giờ thực tế & tự động tính lương 25k/h.
            </p>
          </div>

          {/* Action Tabs & Add Employee Button */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            <div className="bg-emerald-50 p-1 rounded-xl border border-emerald-200 flex items-center gap-1 text-xs sm:text-sm font-bold">
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'weekly'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Theo Tuần
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'monthly'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Bảng Lương Tháng
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'employees'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Nhân Viên ({employees.length})
              </button>
            </div>

            <button
              onClick={openAddEmployeeModal}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm shadow-xs transition-all active:scale-95 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm NV</span>
            </button>
          </div>
        </div>

        {/* TAB 1: WEEKLY SCHEDULING VIEW */}
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            {/* Week Navigation & Controls */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-xl border border-gray-300 font-bold transition-all text-gray-700"
                  title="Tuần trước"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-xl font-bold text-xs sm:text-sm transition-colors border border-emerald-300"
                >
                  Tuần Hợp Thời
                </button>
                <button
                  onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                  className="p-2 hover:bg-gray-100 rounded-xl border border-gray-300 font-bold transition-all text-gray-700"
                  title="Tuần sau"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="font-extrabold text-sm sm:text-base text-gray-800 ml-2">
                  {format(weekStart, 'dd/MM/yyyy')} - {format(weekEnd, 'dd/MM/yyyy')}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAddShiftModal()}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Xếp Ca Mới</span>
                </button>
              </div>
            </div>

            {/* Shift Roster Grid by Days */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isToday = isSameDay(day, new Date());
                const dayShifts = shifts.filter((s) => s.date === dateStr);

                const morningShifts = dayShifts.filter((s) => s.shiftType === 'MORNING');
                const afternoonShifts = dayShifts.filter((s) => s.shiftType === 'AFTERNOON');
                const customShifts = dayShifts.filter((s) => s.shiftType === 'CUSTOM');

                const totalDayHours = dayShifts.reduce((sum, s) => (s.status !== 'ABSENT' ? sum + s.actualHours : sum), 0);

                return (
                  <div
                    key={dateStr}
                    className={`bg-white rounded-2xl border-2 shadow-xs flex flex-col transition-all overflow-hidden ${
                      isToday ? 'border-amber-400 bg-amber-50/20' : 'border-gray-200'
                    }`}
                  >
                    {/* Day Header */}
                    <div
                      className={`p-3 text-center border-b font-bold ${
                        isToday ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-100 text-slate-800 border-gray-200'
                      }`}
                    >
                      <div className="text-xs uppercase tracking-wider font-extrabold">
                        {format(day, 'EEEE', { locale: vi })}
                      </div>
                      <div className="text-lg font-black">{format(day, 'dd/MM')}</div>
                      {totalDayHours > 0 && (
                        <div className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mt-1">
                          Tổng: {totalDayHours}h
                        </div>
                      )}
                    </div>

                    {/* Day Shifts Container */}
                    <div className="p-2 space-y-3 flex-1">
                      {/* CA SÁNG (7h00 - 12h30) */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-black text-amber-800 bg-amber-100/70 px-2 py-1 rounded-md">
                          <span>Ca Sáng (7h-12h30)</span>
                          <button
                            onClick={() => openAddShiftModal(dateStr, 'MORNING')}
                            className="hover:text-amber-950 font-extrabold p-0.5"
                            title="Thêm nhân viên ca sáng"
                          >
                            +
                          </button>
                        </div>

                        {morningShifts.length === 0 ? (
                          <div className="text-[10px] text-gray-400 italic text-center py-1 border border-dashed border-gray-200 rounded">
                            Chưa có NV
                          </div>
                        ) : (
                          morningShifts.map((s) => (
                            <div
                              key={s.id}
                              className={`p-2 rounded-xl border text-xs relative group transition-all ${
                                s.status === 'ABSENT'
                                  ? 'bg-rose-50 border-rose-200 text-rose-800 line-through'
                                  : s.status === 'COMPLETED'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                  : 'bg-amber-50/80 border-amber-200 text-slate-900 font-medium'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold truncate">{s.employee.name}</span>
                                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                                  <button
                                    onClick={() => openEditShiftModal(s)}
                                    className="p-0.5 hover:text-blue-600 text-gray-500"
                                    title="Sửa ca"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShift(s.id)}
                                    className="p-0.5 hover:text-red-600 text-gray-500"
                                    title="Nghỉ ca / Xóa"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Hours & Status */}
                              <div className="flex items-center justify-between mt-1 text-[11px] text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  {editingShiftHoursId === s.id ? (
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={quickHoursValue}
                                      onChange={(e) => setQuickHoursValue(e.target.value)}
                                      onBlur={() => handleQuickUpdateHours(s.id, quickHoursValue)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleQuickUpdateHours(s.id, quickHoursValue);
                                      }}
                                      autoFocus
                                      className="w-12 px-1 py-0.5 bg-white border border-amber-400 rounded text-center text-xs font-bold"
                                    />
                                  ) : (
                                    <span
                                      onClick={() => {
                                        setEditingShiftHoursId(s.id);
                                        setQuickHoursValue(s.actualHours.toString());
                                      }}
                                      className="font-extrabold text-amber-900 bg-amber-200/60 px-1.5 py-0.2 rounded cursor-pointer hover:bg-amber-300"
                                      title="Bấm để chỉnh giờ thực tế"
                                    >
                                      {s.actualHours}h
                                    </span>
                                  )}
                                </div>

                                {/* Status Toggle */}
                                <button
                                  onClick={() =>
                                    handleQuickUpdateStatus(
                                      s.id,
                                      s.status === 'SCHEDULED' ? 'COMPLETED' : s.status === 'COMPLETED' ? 'ABSENT' : 'SCHEDULED'
                                    )
                                  }
                                  className="text-[10px] font-bold underline"
                                  title="Chuyển trạng thái ca (Dự kiến -> Hoàn thành -> Xin nghỉ)"
                                >
                                  {s.status === 'SCHEDULED' && <span className="text-amber-700">Dự kiến</span>}
                                  {s.status === 'COMPLETED' && <span className="text-emerald-700">Đã làm</span>}
                                  {s.status === 'ABSENT' && <span className="text-rose-600">Xin nghỉ</span>}
                                </button>
                              </div>

                              {s.notes && (
                                <div className="text-[10px] text-gray-500 italic mt-0.5 truncate">
                                  {s.notes}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* CA CHIỀU (12h00 - 18h30) */}
                      <div className="space-y-1 pt-1 border-t border-gray-100">
                        <div className="flex items-center justify-between text-[11px] font-black text-blue-800 bg-blue-100/70 px-2 py-1 rounded-md">
                          <span>Ca Chiều (12h-18h30)</span>
                          <button
                            onClick={() => openAddShiftModal(dateStr, 'AFTERNOON')}
                            className="hover:text-blue-950 font-extrabold p-0.5"
                            title="Thêm nhân viên ca chiều"
                          >
                            +
                          </button>
                        </div>

                        {afternoonShifts.length === 0 ? (
                          <div className="text-[10px] text-gray-400 italic text-center py-1 border border-dashed border-gray-200 rounded">
                            Chưa có NV
                          </div>
                        ) : (
                          afternoonShifts.map((s) => (
                            <div
                              key={s.id}
                              className={`p-2 rounded-xl border text-xs relative group transition-all ${
                                s.status === 'ABSENT'
                                  ? 'bg-rose-50 border-rose-200 text-rose-800 line-through'
                                  : s.status === 'COMPLETED'
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                                  : 'bg-blue-50/80 border-blue-200 text-slate-900 font-medium'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold truncate">{s.employee.name}</span>
                                <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                                  <button
                                    onClick={() => openEditShiftModal(s)}
                                    className="p-0.5 hover:text-blue-600 text-gray-500"
                                    title="Sửa ca"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteShift(s.id)}
                                    className="p-0.5 hover:text-red-600 text-gray-500"
                                    title="Nghỉ ca / Xóa"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Hours & Status */}
                              <div className="flex items-center justify-between mt-1 text-[11px] text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-600" />
                                  {editingShiftHoursId === s.id ? (
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={quickHoursValue}
                                      onChange={(e) => setQuickHoursValue(e.target.value)}
                                      onBlur={() => handleQuickUpdateHours(s.id, quickHoursValue)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleQuickUpdateHours(s.id, quickHoursValue);
                                      }}
                                      autoFocus
                                      className="w-12 px-1 py-0.5 bg-white border border-blue-400 rounded text-center text-xs font-bold"
                                    />
                                  ) : (
                                    <span
                                      onClick={() => {
                                        setEditingShiftHoursId(s.id);
                                        setQuickHoursValue(s.actualHours.toString());
                                      }}
                                      className="font-extrabold text-blue-900 bg-blue-200/60 px-1.5 py-0.2 rounded cursor-pointer hover:bg-blue-300"
                                      title="Bấm để chỉnh giờ thực tế"
                                    >
                                      {s.actualHours}h
                                    </span>
                                  )}
                                </div>

                                <button
                                  onClick={() =>
                                    handleQuickUpdateStatus(
                                      s.id,
                                      s.status === 'SCHEDULED' ? 'COMPLETED' : s.status === 'COMPLETED' ? 'ABSENT' : 'SCHEDULED'
                                    )
                                  }
                                  className="text-[10px] font-bold underline"
                                >
                                  {s.status === 'SCHEDULED' && <span className="text-blue-700">Dự kiến</span>}
                                  {s.status === 'COMPLETED' && <span className="text-emerald-700">Đã làm</span>}
                                  {s.status === 'ABSENT' && <span className="text-rose-600">Xin nghỉ</span>}
                                </button>
                              </div>

                              {s.notes && (
                                <div className="text-[10px] text-gray-500 italic mt-0.5 truncate">
                                  {s.notes}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* CA TÙY CHỌN (CUSTOM) */}
                      {customShifts.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-gray-100">
                          <div className="text-[10px] font-black text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded">
                            Ca Tùy Chọn
                          </div>
                          {customShifts.map((s) => (
                            <div key={s.id} className="p-2 bg-purple-50 border border-purple-200 rounded-xl text-xs">
                              <div className="flex justify-between font-bold text-purple-950">
                                <span>{s.employee.name}</span>
                                <span>{s.startTime}-{s.endTime}</span>
                              </div>
                              <div className="text-[10px] text-purple-700 font-bold mt-1">
                                {s.actualHours} giờ ({s.status})
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: MONTHLY PAYROLL & TIME TRACKING */}
        {activeTab === 'monthly' && (
          <div className="space-y-6">
            {/* Month Filter & Export */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-base font-bold text-gray-700">Chọn Tháng Bảng Lương:</label>
                <input
                  type="month"
                  value={currentMonthStr}
                  onChange={(e) => setCurrentMonthStr(e.target.value)}
                  className="border-2 border-emerald-400 rounded-xl p-2 font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={handleExportPayroll}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 w-full sm:w-auto justify-center"
              >
                <FileSpreadsheet className="w-5 h-5" />
                <span>Xuất Bảng Lương Excel</span>
              </button>
            </div>

            {/* Payroll Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-xs">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Tổng Số Nhân Viên</div>
                <div className="text-3xl font-black text-blue-900">{employees.length} người</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border-2 border-amber-200 shadow-xs">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Tổng Số Giờ Làm (Tháng {currentMonthStr})</div>
                <div className="text-3xl font-black text-amber-900">
                  {monthShifts.filter((s) => s.status !== 'ABSENT').reduce((sum, s) => sum + s.actualHours, 0)} giờ
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-200 shadow-xs">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Tổng Quỹ Lương Dự Kiến</div>
                <div className="text-3xl font-black text-emerald-700">
                  {formatCurrency(
                    employees.reduce((total, emp) => {
                      const hours = monthShifts
                        .filter((s) => s.employeeId === emp.id && s.status !== 'ABSENT')
                        .reduce((sum, s) => sum + s.actualHours, 0);
                      return total + hours * emp.hourlyRate;
                    }, 0)
                  )}
                </div>
              </div>
            </div>

            {/* Payroll Detailed Table */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-lg font-black text-emerald-950 flex items-center gap-2">
                    {currentMonthStr < format(new Date(), 'yyyy-MM') ? (
                      <span className="text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wide">
                        📜 Lịch Sử Đi Làm Thực Tế
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wide">
                        📅 Lịch Xếp Ca Dự Kiến
                      </span>
                    )}
                    <span>Chi Tiết Giờ Làm & Lương ({currentMonthStr})</span>
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {currentMonthStr < format(new Date(), 'yyyy-MM')
                      ? 'Dữ liệu chấm công và giờ làm thực tế của nhân viên đã hoàn thành trong quá khứ.'
                      : 'Lịch phân ca làm việc dự kiến và dự toán quỹ lương cho tháng này.'}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Đơn giá: 25.000 đ/h
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-black border-b border-gray-300">
                      <th className="p-3.5 text-center">STT</th>
                      <th className="p-3.5">Họ và Tên Nhân Viên</th>
                      <th className="p-3.5">Số Điện Thoại</th>
                      <th className="p-3.5 text-center">Lương / Giờ</th>
                      <th className="p-3.5 text-center">Tổng Số Ca Làm</th>
                      <th className="p-3.5 text-center">Tổng Số Giờ Làm</th>
                      <th className="p-3.5 text-right">Tổng Lương Dự Kiến</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 font-bold">
                          Chưa có nhân viên nào. Hãy thêm nhân viên ở tab "Nhân Viên".
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp, index) => {
                        const empShifts = monthShifts.filter((s) => s.employeeId === emp.id && s.status !== 'ABSENT');
                        const totalHours = empShifts.reduce((sum, s) => sum + s.actualHours, 0);
                        const totalSalary = totalHours * emp.hourlyRate;

                        return (
                          <tr key={emp.id} className="border-b border-gray-200 hover:bg-emerald-50/20 transition-colors">
                            <td className="p-3.5 text-center font-bold text-gray-500">{index + 1}</td>
                            <td className="p-3.5 font-bold text-gray-900">{emp.name}</td>
                            <td className="p-3.5 text-gray-600 font-medium">{emp.phone || '-'}</td>
                            <td className="p-3.5 text-center font-bold text-amber-700">
                              {emp.hourlyRate.toLocaleString('vi-VN')} đ/h
                            </td>
                            <td className="p-3.5 text-center font-bold text-blue-700">
                              {empShifts.length} ca
                            </td>
                            <td className="p-3.5 text-center font-black text-gray-900 bg-gray-50 text-base">
                              {totalHours} giờ
                            </td>
                            <td className="p-3.5 text-right font-black text-emerald-700 text-lg">
                              {formatCurrency(totalSalary)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: EMPLOYEES MANAGEMENT */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Danh Sách Nhân Viên Theo Giờ</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  Thêm, sửa, xóa thông tin nhân viên & điều chỉnh mức lương theo giờ.
                </p>
              </div>

              <button
                onClick={openAddEmployeeModal}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Nhân Viên</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {employees.length === 0 ? (
                <div className="col-span-full bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 font-bold">
                  Chưa có nhân viên nào trong hệ thống.
                </div>
              ) : (
                employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-white p-5 rounded-2xl border-2 border-gray-200 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-black text-gray-900">{emp.name}</h3>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            SĐT: {emp.phone || 'Chưa cập nhật'}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-black rounded-lg">
                          {emp.hourlyRate.toLocaleString('vi-VN')} đ/h
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => openEditEmployeeModal(emp)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      {showEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-black text-gray-900">
                {editingEmployee ? 'Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}
              </h3>
              <button onClick={closeEmployeeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Tên Nhân Viên (*)
                </label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  required
                  className="w-full border border-gray-300 rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Số Điện Thoại
                </label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="VD: 0987654321"
                  className="w-full border border-gray-300 rounded-xl p-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Mức Lương / Giờ (VND)
                </label>
                <input
                  type="number"
                  value={empRate}
                  onChange={(e) => setEmpRate(e.target.value)}
                  placeholder="25000"
                  required
                  className="w-full border border-gray-300 rounded-xl p-3 text-base font-bold text-amber-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Mặc định: 25.000 VNĐ / 1 giờ làm việc.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeEmployeeModal}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  Lưu Nhân Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT SHIFT */}
      {showShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-xl font-black text-gray-900">
                {editingShift ? 'Chỉnh Sửa Ca Làm Việc' : 'Xếp Ca Làm Việc Mới'}
              </h3>
              <button onClick={closeShiftModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4">
              {/* Select Employee */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Chọn Nhân Viên (*)
                </label>
                <select
                  value={shiftEmpId}
                  onChange={(e) => setShiftEmpId(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl p-3 text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="" disabled>
                    -- Chọn nhân viên --
                  </option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.hourlyRate.toLocaleString('vi-VN')}đ/h)
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Ngày Phân Ca (*)
                </label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl p-3 text-base font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Shift Type Presets */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Loại Ca Làm
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleShiftTypeChange('MORNING')}
                    className={`p-3 rounded-xl border text-xs font-extrabold flex flex-col items-center gap-1 transition-all ${
                      shiftType === 'MORNING'
                        ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-400'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <span>Ca Sáng</span>
                    <span className="text-[10px] font-normal text-amber-800">7h00 - 12h30 (5.5h)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShiftTypeChange('AFTERNOON')}
                    className={`p-3 rounded-xl border text-xs font-extrabold flex flex-col items-center gap-1 transition-all ${
                      shiftType === 'AFTERNOON'
                        ? 'bg-blue-100 border-blue-400 text-blue-950 ring-2 ring-blue-400'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <span>Ca Chiều</span>
                    <span className="text-[10px] font-normal text-blue-800">12h00 - 18h30 (6.5h)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleShiftTypeChange('CUSTOM')}
                    className={`p-3 rounded-xl border text-xs font-extrabold flex flex-col items-center gap-1 transition-all ${
                      shiftType === 'CUSTOM'
                        ? 'bg-purple-100 border-purple-400 text-purple-950 ring-2 ring-purple-400'
                        : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    <span>Tùy Chỉnh</span>
                    <span className="text-[10px] font-normal text-purple-800">Nhập giờ riêng</span>
                  </button>
                </div>
              </div>

              {/* Start Time, End Time, Actual Hours */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Bắt đầu</label>
                  <input
                    type="text"
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                    placeholder="07:00"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Kết thúc</label>
                  <input
                    type="text"
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                    placeholder="12:30"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-800 mb-1">Giờ Thực Tế</label>
                  <input
                    type="number"
                    step="0.5"
                    value={shiftActualHours}
                    onChange={(e) => setShiftActualHours(e.target.value)}
                    placeholder="5.5"
                    required
                    className="w-full border-2 border-emerald-400 rounded-xl p-2.5 text-sm font-black text-center text-emerald-800 bg-emerald-50"
                  />
                </div>
              </div>

              {/* Shift Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Trạng Thái Ca
                </label>
                <select
                  value={shiftStatus}
                  onChange={(e) => setShiftStatus(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="SCHEDULED">Dự kiến (Đã xếp lịch)</option>
                  <option value="COMPLETED">Hoàn thành (Đã đi làm)</option>
                  <option value="ABSENT">Xin nghỉ ca (Nghỉ)</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Ghi Chú
                </label>
                <input
                  type="text"
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  placeholder="Ghi chú thêm (VD: Xin đi trễ 15p...)"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                {editingShift ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteShift(editingShift.id)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs"
                  >
                    Xóa Ca
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeShiftModal}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 font-bold text-gray-700 text-sm hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
                  >
                    Lưu Ca Làm
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
