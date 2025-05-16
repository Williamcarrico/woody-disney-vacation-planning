import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-md w-full"
            >
                {/* 404 Number with decorative elements */}
                <div className="relative mb-6">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut"
                        }}
                    >
                        <h1 className="text-9xl font-extrabold text-primary/10 select-none">404</h1>
                    </motion.div>
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <h2 className="text-4xl font-bold text-primary">Page Not Found</h2>
                    </motion.div>
                </div>

                {/* Message */}
                <motion.p
                    className="mb-8 text-muted-foreground text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </motion.p>

                {/* Navigation options */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                >
                    <Button asChild size="lg" className="min-w-[150px]">
                        <Link href="/">
                            Return Home
                        </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="min-w-[150px]">
                        <Link href="/help">
                            Get Help
                        </Link>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    )
}