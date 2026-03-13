import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className = 'w-32', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo-carapari.png"
            alt="Carapari"
            className={`object-contain ${className}`}
            {...props}
        />
    );
}
