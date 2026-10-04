import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, hourlyRate } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Tên nhân viên là bắt buộc' }, { status: 400 });
    }

    const newEmployee = await prisma.employee.create({
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : null,
        hourlyRate: hourlyRate && !isNaN(Number(hourlyRate)) ? Number(hourlyRate) : 25000,
      },
    });

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}
