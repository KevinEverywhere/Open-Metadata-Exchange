import { classNames } from 'shared/lib/classNames/classNames';
import cls from './NotFoundPage.module.scss';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface NotFoundPageProps {
	className?: string;
}

export const NotFoundPage = ({ className }: NotFoundPageProps) => {
	const navigate = useNavigate();
	useEffect(() => {
		setTimeout(() => {
			navigate('/imls', { replace: true });
		}, 5000);
	}, []);

	return (
		<div className={classNames(cls.NotFoundPage, {}, [className])}>
			<h1>Redirecting . . .</h1>
		</div>
	);
};

export default NotFoundPage;
