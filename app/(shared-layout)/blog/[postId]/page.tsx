import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CommentSection } from '@/components/web/CommontSection';
import { PostPresence } from '@/components/web/PostPresence';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { fetchAuthQuery } from '@/lib/auth-server';
import { fetchQuery, preloadQuery } from 'convex/nextjs';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface PostIdRouteProps {
	params: Promise<{
		postId: Id<'posts'>;
	}>;
}

export async function generateMetadata({
	params,
}: PostIdRouteProps): Promise<Metadata> {
	const { postId } = await params;
	const post = await fetchQuery(api.posts.getPostById, { postId: postId });
	if (!post) {
		return {
			title: 'Post not found',
		};
	}
	return {
		title: post.title,
		description: post.body,
	};
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {
	const { postId } = await params;
	const [post, preLoadedComments, userId] = await Promise.all([
		await fetchQuery(api.posts.getPostById, { postId: postId }),
		await preloadQuery(api.comments.getCommentsByPostId, {
			postId: postId,
		}),
		await fetchAuthQuery(api.presence.getUserId),
	]);
	if (!userId) {
		return redirect('/auth/login');
	}
	if (!post)
		return (
			<div>
				<h1 className='text-6xl font-extrabold text-red-500 py-20'>
					No post found
				</h1>
			</div>
		);
	return (
		<div className='max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative'>
			<Link
				href={'/blog'}
				className={buttonVariants({
					variant: 'outline',
					className: 'mb-4',
				})}
			>
				<ArrowLeft className='size-4' />
				Back to blog
			</Link>
			<div className='relative w-full h-100 mb-8 rounded-xl overflow-hidden shadow-sm'>
				<Image
					src={
						post.imageUrl ??
						'https://images.unsplash.com/photo-1544894079-e81a9eb1da8b?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
					}
					alt={post.title}
					fill
					className='object-cover hover:scale-105 transition-transform duration-500'
				/>
			</div>
			<div className='space-y-4 flex flex-col'>
				<h1 className='text-4xl font-bold tracking-tight text-foreground'>
					{post.title}
				</h1>
				<div className='flex items-center gap-2 '>
					<p className='text-sm text-muted-foreground'>
						Posted on:{' '}
						{new Date(post._creationTime).toLocaleDateString(
							'km-KH',
						)}
					</p>
					{userId && (
						<PostPresence roomId={post._id} userId={userId} />
					)}
				</div>
			</div>
			<Separator className='my-8' />
			<p className='text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap'>
				{post.body}
			</p>
			<Separator className='my-8' />
			<CommentSection preloadedComments={preLoadedComments} />
		</div>
	);
}
