/**
 * /api/admin/users
 *
 * GET  — Admin: returns all users (paginated, searchable)
 * PATCH — Superadmin: change a user's role (user → admin or admin → user)
 *
 * Cannot demote superadmin role (protected).
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/models/User';
import { requireAdmin, requireSuperAdmin, handleAuthError } from '@/lib/auth-helpers';
import { z } from 'zod';

const roleUpdateSchema = z.object({
  userId: z.string().min(1),
  newRole: z.enum(['user', 'admin']), // Cannot set superadmin via API
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectToDatabase();

    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '25', 10));
    const search = searchParams.get('search')?.trim() ?? '';
    const role = searchParams.get('role')?.trim() ?? 'all';
    const branch = searchParams.get('branch')?.trim() ?? 'all';
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollId: { $regex: search, $options: 'i' } },
        { cfHandle: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    if (branch && branch !== 'all') {
      filter.deptCode = branch.toUpperCase();
    }

    const [
      total,
      users,
      globalTotal,
      globalVerified,
      globalOnboarded,
      globalAdmins,
      branchCountsRaw,
    ] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter, {
        name: 1, displayName: 1, email: 1, image: 1, rollId: 1, batch: 1,
        department: 1, gender: 1, cfHandle: 1, cfRating: 1, isCfVerified: 1,
        role: 1, totalPoints: 1, scores: 1, isOnboardingComplete: 1, createdAt: 1,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments({}),
      User.countDocuments({ isCfVerified: true }),
      User.countDocuments({ isOnboardingComplete: true }),
      User.countDocuments({ role: { $in: ['admin', 'superadmin'] } }),
      User.aggregate([
        { $match: { deptCode: { $exists: true, $ne: '' } } },
        { $group: { _id: '$deptCode', count: { $sum: 1 } } },
      ]),
    ]);

    const branchCounts = branchCountsRaw.reduce((acc, curr) => {
      if (curr._id) {
        acc[curr._id.toUpperCase()] = curr.count;
      }
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      users: users.map((u) => ({ ...u, _id: u._id.toString() })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        total: globalTotal,
        verified: globalVerified,
        onboarded: globalOnboarded,
        admins: globalAdmins,
        branchCounts,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

// ─── PATCH /api/admin/users ───────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    await requireSuperAdmin(); // Only superadmin can change roles

    const body = await req.json();
    const parsed = roleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { userId, newRole } = parsed.data;
    await connectToDatabase();

    const targetUser = await User.findById(userId).lean();
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Protect superadmin from demotion
    if (targetUser.role === 'superadmin') {
      return NextResponse.json(
        { error: 'Cannot change superadmin role' },
        { status: 403 }
      );
    }

    await User.findByIdAndUpdate(userId, { $set: { role: newRole } });

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.email} role updated to ${newRole}`,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
