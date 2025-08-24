import { memo, useEffect, useRef, useState } from 'react';
import { LuUser, LuUpload, LuTrash } from 'react-icons/lu';

const ProfilePhotoSelector = ({ image, setImage }) => {
	const inputRef = useRef(null);
	const [previewUrl, setPreviewUrl] = useState(null);

	useEffect(() => {
		return () => {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
		};
	}, [previewUrl]);

	const handleImageChange = (event) => {
		const file = event?.target?.files?.[0];
		if (!file) return;
		setImage(file);
		const url = URL.createObjectURL(file);
		setPreviewUrl(url);
	};

	const handleRemoveImage = () => {
		setImage(null);
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		setPreviewUrl(null);
		if (inputRef.current) inputRef.current.value = '';
	};

	const onChooseFile = () => {
		if (inputRef.current) inputRef.current.click();
	};

	return (
		<div className='flex justify-center mb-6'>
			<input
				type='file'
				accept='image/*'
				ref={inputRef}
				onChange={handleImageChange}
				className='hidden'
			/>

			{!previewUrl ? (
				<div className='w-20 h-20 flex items-center justify-center bg-purple-100 rounded-full relative overflow-hidden'>
					<LuUser className="text-4xl text-primary" />
					<button
						type='button'
						className='w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1'
						onClick={onChooseFile}
					>
						<LuUpload />
					</button>
				</div>
			) : (
				<div className='relative w-24 h-24'>
					<img
						src={previewUrl}
						alt='profile photo'
						className='w-24 h-24 rounded-full object-cover border border-slate-200'
					/>
					<button
						type='button'
						className='w-8 h-8 flex items-center justify-center bg-rose-500 text-white rounded-full absolute -bottom-1 -right-1'
						onClick={handleRemoveImage}
					>
						<LuTrash />
					</button>
				</div>
			)}
		</div>
	);
};

export default memo(ProfilePhotoSelector);