import './globals.css'

export const metadata = {
  title: 'Interview Question Generator',
  description: 'Generate interview questions with a refined semantic color system.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-primary-text antialiased">
        {children}
      </body>
    </html>
  )
}
