"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/actions/activity";
import { generateSlug, ensureUniqueSlug } from "@/lib/slugify";
import { PostCategory, PostStatus } from "@prisma/client";

const PAGE_SIZE = 9;

// ─── Shared Types ──────────────────────────────────────────────────────────────

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  category: PostCategory;
  tags: string[];
  publishedAt: Date | null;
  author: { name: string };
};

export type ReplyRow = {
  id: string;
  userId: string;
  body: string;
  createdAt: Date;
  user: { name: string; image: string | null };
};

export type CommentRow = {
  id: string;
  userId: string;
  body: string;
  createdAt: Date;
  user: { name: string; image: string | null };
  replies: ReplyRow[];
};

export type PostDetail = PostSummary & {
  content: string;
  author: { name: string; image: string | null };
  comments: CommentRow[];
};

export type AdminPostRow = {
  id: string;
  title: string;
  slug: string;
  status: PostStatus;
  category: PostCategory;
  publishedAt: Date | null;
  createdAt: Date;
  authorName: string;
  commentCount: number;
};

export type PostEditData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: PostCategory;
  tags: string[];
  status: PostStatus;
  publishedAt: Date | null;
};

// ─── Public Reads (no auth) ────────────────────────────────────────────────────

export async function getPublishedPosts(opts?: {
  page?: number;
  category?: PostCategory;
  search?: string;
}): Promise<{ posts: PostSummary[]; total: number; totalPages: number }> {
  const page = Math.max(1, opts?.page ?? 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    status: PostStatus.PUBLISHED,
    ...(opts?.category ? { category: opts.category } : {}),
    ...(opts?.search
      ? {
          OR: [
            { title: { contains: opts.search, mode: "insensitive" as const } },
            { excerpt: { contains: opts.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        tags: true,
        publishedAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getFeaturedPost(): Promise<PostSummary | null> {
  return prisma.post.findFirst({
    where: { status: PostStatus.PUBLISHED },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      category: true,
      tags: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

export async function getPublishedPostBySlug(
  slug: string
): Promise<PostDetail | null> {
  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      category: true,
      tags: true,
      publishedAt: true,
      status: true,
      author: { select: { name: true, image: true } },
      comments: {
        where: { parentId: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          body: true,
          createdAt: true,
          user: { select: { name: true, image: true } },
          replies: {
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              userId: true,
              body: true,
              createdAt: true,
              user: { select: { name: true, image: true } },
            },
          },
        },
      },
    },
  });

  if (!post || post.status !== PostStatus.PUBLISHED) return null;

  return post;
}

export async function getRelatedPosts(
  postId: string,
  category: PostCategory
): Promise<PostSummary[]> {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      category,
      NOT: { id: postId },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      category: true,
      tags: true,
      publishedAt: true,
      author: { select: { name: true } },
    },
  });
}

// ─── Admin Reads ───────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getAllPostsAdmin(): Promise<AdminPostRow[]> {
  await requireAdmin();

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      category: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });

  return posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
    category: p.category,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
    authorName: p.author.name,
    commentCount: p._count.comments,
  }));
}

export async function getPostByIdForEdit(
  postId: string
): Promise<PostEditData | null> {
  await requireAdmin();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      category: true,
      tags: true,
      status: true,
      publishedAt: true,
    },
  });

  return post;
}

export async function getPostStats(): Promise<{
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalComments: number;
}> {
  await requireAdmin();

  const [totalPosts, publishedPosts, totalComments] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: PostStatus.PUBLISHED } }),
    prisma.comment.count(),
  ]);

  return {
    totalPosts,
    publishedPosts,
    draftPosts: totalPosts - publishedPosts,
    totalComments,
  };
}

// ─── Admin Writes ──────────────────────────────────────────────────────────────

export async function createPost(data: {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: PostCategory;
  tags: string[];
  status: PostStatus;
}): Promise<{ success: boolean; slug: string }> {
  const session = await requireAdmin();

  const slug = await ensureUniqueSlug(generateSlug(data.title));
  const isPublished = data.status === PostStatus.PUBLISHED;

  await prisma.post.create({
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage || null,
      category: data.category,
      tags: data.tags,
      status: data.status,
      publishedAt: isPublished ? new Date() : null,
      authorId: session.user.id,
    },
  });

  await logActivity({
    userId: session.user.id,
    type: "POST",
    action: isPublished
      ? `published post "${data.title}"`
      : `saved draft "${data.title}"`,
  });

  revalidatePath("/blog");
  revalidatePath("/admin/posts");

  return { success: true, slug };
}

export async function updatePost(
  postId: string,
  data: {
    title: string;
    excerpt: string;
    content: string;
    coverImage?: string;
    category: PostCategory;
    tags: string[];
    status: PostStatus;
  }
): Promise<{ success: boolean; slug: string }> {
  const session = await requireAdmin();

  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { title: true, slug: true, publishedAt: true, status: true },
  });
  if (!existing) throw new Error("Post not found");

  const titleChanged = existing.title !== data.title;
  const slug = titleChanged
    ? await ensureUniqueSlug(generateSlug(data.title), postId)
    : existing.slug;

  const isPublished = data.status === PostStatus.PUBLISHED;
  const firstPublish =
    isPublished &&
    existing.status !== PostStatus.PUBLISHED &&
    !existing.publishedAt;

  await prisma.post.update({
    where: { id: postId },
    data: {
      title: data.title,
      slug,
      excerpt: data.excerpt,
      content: data.content,
      coverImage: data.coverImage || null,
      category: data.category,
      tags: data.tags,
      status: data.status,
      ...(firstPublish ? { publishedAt: new Date() } : {}),
    },
  });

  await logActivity({
    userId: session.user.id,
    type: "POST",
    action: `updated post "${data.title}"`,
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/posts");

  return { success: true, slug };
}

export async function deletePost(postId: string): Promise<void> {
  const session = await requireAdmin();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { title: true, slug: true },
  });
  if (!post) return;

  await prisma.post.delete({ where: { id: postId } });

  await logActivity({
    userId: session.user.id,
    type: "POST",
    action: `deleted post "${post.title}"`,
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/posts");
}

// ─── Comment Actions ───────────────────────────────────────────────────────────

export async function addComment(
  postId: string,
  body: string
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) throw new Error("Unauthorized");

  const trimmed = body.trim();
  if (!trimmed) throw new Error("Comment cannot be empty");
  if (trimmed.length > 2000) throw new Error("Comment too long");

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { slug: true, title: true, authorId: true },
  });
  if (!post) throw new Error("Post not found");

  await prisma.comment.create({
    data: {
      body: trimmed,
      postId,
      userId: session.user.id,
    },
  });

  // Notify post author (unless they commented on their own post)
  if (post.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "COMMENT",
        message: `${session.user.name} commented on your post`,
        postSlug: post.slug,
        postTitle: post.title,
      },
    });
  }

  await logActivity({
    userId: session.user.id,
    type: "POST",
    action: `commented on "${post.title}"`,
  });

  revalidatePath(`/blog/${post.slug}`);
}

export async function addReply(
  parentCommentId: string,
  body: string
): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) throw new Error("Unauthorized");

  const trimmed = body.trim();
  if (!trimmed) throw new Error("Reply cannot be empty");
  if (trimmed.length > 2000) throw new Error("Reply too long");

  const parent = await prisma.comment.findUnique({
    where: { id: parentCommentId },
    select: {
      id: true,
      userId: true,
      post: { select: { id: true, slug: true, title: true, authorId: true } },
    },
  });
  if (!parent) throw new Error("Comment not found");

  await prisma.comment.create({
    data: {
      body: trimmed,
      postId: parent.post.id,
      userId: session.user.id,
      parentId: parentCommentId,
    },
  });

  // Notify the parent comment author (unless replying to yourself)
  if (parent.userId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: parent.userId,
        type: "REPLY",
        message: `${session.user.name} replied to your comment on "${parent.post.title}"`,
        postSlug: parent.post.slug,
        postTitle: parent.post.title,
      },
    });
  }

  await logActivity({
    userId: session.user.id,
    type: "POST",
    action: `replied to a comment on "${parent.post.title}"`,
  });

  revalidatePath(`/blog/${parent.post.slug}`);
}

export async function deleteComment(commentId: string): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !session.user) throw new Error("Unauthorized");

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      userId: true,
      post: { select: { slug: true, title: true } },
    },
  });
  if (!comment) return;

  const isAdmin = (session.user as any).role === "admin";
  const isAuthor = comment.userId === session.user.id;
  if (!isAdmin && !isAuthor) throw new Error("Unauthorized");

  await prisma.comment.delete({ where: { id: commentId } });

  if (isAdmin && !isAuthor) {
    await logActivity({
      userId: session.user.id,
      type: "POST",
      action: `removed a comment on "${comment.post.title}"`,
    });
  }

  revalidatePath(`/blog/${comment.post.slug}`);
}
