'use client';
import { Loader2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { commentSchema } from '@/app/schemas/comment';
import { Field, FieldError, FieldLabel } from '../ui/field';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { useParams } from 'next/navigation';
import { Id } from '@/convex/_generated/dataModel';
import {
	Preloaded,
	useMutation,
	usePreloadedQuery,
} from 'convex/react';
import { api } from '@/convex/_generated/api';
import z from 'zod';
import { toast } from 'sonner';
import { useTransition } from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AvatarImage } from '@radix-ui/react-avatar';
import { Separator } from '../ui/separator';

export function CommentSection(props: {
	preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
}) {
	const [isPending, startTransition] = useTransition();
	const params = useParams<{ postId: Id<'posts'> }>();
	const createComment = useMutation(api.comments.createComment);
	const data = usePreloadedQuery(props.preloadedComments);
	const form = useForm({
		resolver: zodResolver(commentSchema),
		defaultValues: {
			body: '',
			postId: params.postId,
		},
	});

	async function handleSubmit(data: z.infer<typeof commentSchema>) {
		startTransition(async () => {
			try {
				await createComment(data);
				form.reset();
				toast.success('Comment posted');
			} catch {
				toast.error('Failed to create post');
			}
		});
	}
	if (data == undefined) return <p>Loading...</p>;
	return (
		<Card>
			<CardHeader className='flex flex-row items-center gap-2 border-b'>
				<MessageSquare className='size-5' />
				<h2 className='text-xl font-bold'>{data.length} comments</h2>
			</CardHeader>
			<CardContent className='space-y-8'>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					className='space-y-4'
				>
					<Controller
						name='body'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel>Add comment</FieldLabel>
								<Textarea
									aria-invalid={fieldState.invalid}
									placeholder='Share your thoughts'
									{...field}
								/>
								{fieldState.error && (
									<FieldError errors={[fieldState.error]} />
								)}
							</Field>
						)}
					/>
					<Button>
						{isPending ? (
							<>
								<Loader2 className='size-4 animate-spin' />
								<span>Loading...</span>
							</>
						) : (
							<span>Comment</span>
						)}
					</Button>
				</form>
				{data?.length > 0 && <Separator />}
				<section className='space-y-6'>
					{data?.map((comment) => (
						<div key={comment._id} className='flex gap-4'>
							<Avatar className='size-10 shrink-0'>
								<AvatarImage
									src={`https://avatar.vercel.sh/${comment.authorName}?rounded=60`}
									alt={comment.authorName}
								/>
								<AvatarFallback>
									{comment.authorName
										.slice(0, 2)
										.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className='flex-1 space-y-1'>
								<div className='flex items-center justify-between'>
									<p className='font-semibold text-sm'>
										{comment.authorName}
									</p>
									<p className='text-muted-foreground text-xs'>
										{new Date(
											comment._creationTime,
										).toLocaleDateString()}
									</p>
								</div>
								<p className='text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed'>
									{comment.body}
								</p>
							</div>
						</div>
					))}
				</section>
			</CardContent>
		</Card>
	);
}
