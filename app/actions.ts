'use server';

import z from 'zod';
import { postSchema } from './schemas/blog';
import { api } from '@/convex/_generated/api';
import { redirect } from 'next/navigation';
import { fetchAuthMutation } from '@/lib/auth-server';
import { updateTag } from 'next/cache';

export async function createBlogActions(value: z.infer<typeof postSchema>) {
	try {
		const parsed = postSchema.safeParse(value);
		if (!parsed.success) {
			throw new Error('Something went wrong');
		}
		const imageUrl = await fetchAuthMutation(
			api.posts.generateImageUploadUrl,
		);
		const uploadResult = await fetch(imageUrl, {
			method: 'POST',
			headers: {
				'Content-Type': parsed.data.image.type,
			},
			body: parsed.data.image,
		});
		if (!uploadResult.ok) {
			return {
				error: 'Fail to upload image',
			};
		}
		const { storageId } = await uploadResult.json();
		await fetchAuthMutation(api.posts.createPost, {
			title: parsed.data.title,
			body: parsed.data.content,
			imageStorageId: storageId,
		});
	} catch (error) {
		return {
			error: 'Fail to create post!',
		};
	}
	// revalidatePath('/blog');
	updateTag('blog');
	return redirect('/blog');
}
