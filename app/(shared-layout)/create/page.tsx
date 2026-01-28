'use client';
import { createBlogActions } from '@/app/actions';
import { postSchema } from '@/app/schemas/blog';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import z from 'zod';

export default function CreateRoute() {
	const [isPending, startTransition] = useTransition();
	const form = useForm({
		resolver: zodResolver(postSchema),
		defaultValues: {
			title: '',
			content: '',
			image: undefined,
		},
	});

	function onSubmit(value: z.infer<typeof postSchema>) {
		startTransition(async () => {
			await createBlogActions(value);
		});
	}

	return (
		<div className='py-12'>
			<div className='text-center mb-12'>
				<h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl'>
					Create Post
				</h1>
				<p className='text-xl text-muted-foreground pt-4'>
					Share your thought with the big world
				</p>
			</div>
			<Card className='w-ful max-w-xl mx-auto'>
				<CardHeader>
					<CardTitle>Create Blog Article</CardTitle>
					<CardDescription>Create a new blog article</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<FieldGroup className='gap-y-4'>
							<Controller
								name='title'
								control={form.control}
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel>Title</FieldLabel>
										<Input
											aria-invalid={fieldState.invalid}
											placeholder='Super cool title'
											{...field}
										/>
										{fieldState.error && (
											<FieldError
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								)}
							/>
							<Controller
								name='content'
								control={form.control}
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel>Content</FieldLabel>
										<Textarea
											aria-invalid={fieldState.invalid}
											placeholder='Super cool blog content'
											{...field}
										/>
										{fieldState.error && (
											<FieldError
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								)}
							/>

							<Controller
								name='image'
								control={form.control}
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel>image</FieldLabel>
										<Input
											aria-invalid={fieldState.invalid}
											placeholder='Super cool title'
											type='file'
											accept='image/*'
											onChange={(event) => {
												const file =
													event.target.files?.[0];
												field.onChange(file);
											}}
										/>
										{fieldState.error && (
											<FieldError
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								)}
							/>
							<Button type='submit' disabled={isPending}>
								{isPending ? (
									<>
										<Loader2 className='size-4 animate-spin' />
										<span>Posting...</span>
									</>
								) : (
									<span>Create Post</span>
								)}
							</Button>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
