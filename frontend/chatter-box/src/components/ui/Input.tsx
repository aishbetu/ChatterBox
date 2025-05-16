interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export default function Input({ label, ...props }: InputProps) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium mb-1">{label}</label>
            <input className="w-full px-4 border rounded-md focus:outline-none focus:ring" {...props} />
        </div>
    )
}