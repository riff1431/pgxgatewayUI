import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  Globe2, 
  Lock, 
  ShieldCheck, 
  Zap 
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'

export default function Home() {
  return (
    <div className="flex flex-col gap-12 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 border-primary/30">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Vite + React 19 + Tailwind v4 + Shadcn UI + React Router
          </Badge>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Next-Gen Payment Gateway for Modern Commerce
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
          Ultra-fast, secure checkout infrastructure with multi-currency settlement, instant webhook delivery, and modern UI components.
        </p>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="gap-2">
            <Link to="/checkout">
              Explore Checkout Demo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
              Shadcn UI Docs
            </a>
          </Button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 w-full">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle>Bank-Grade Security</CardTitle>
            <CardDescription>
              PCI-DSS compliant tokenization with end-to-end encryption for every transaction.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>3D Secure 2.0 authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>AI fraud anomaly detection</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Badge variant="secondary" className="text-xs">Zero-Trust Architecture</Badge>
          </CardFooter>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Zap className="h-5 w-5" />
            </div>
            <CardTitle>Instant Settlements</CardTitle>
            <CardDescription>
              Lightning fast payouts directly to bank accounts or merchant wallets in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Sub-second payment processing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Automated reconciliation</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Badge variant="secondary" className="text-xs">Realtime Webhooks</Badge>
          </CardFooter>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Globe2 className="h-5 w-5" />
            </div>
            <CardTitle>Global Payment Rail</CardTitle>
            <CardDescription>
              Accept credit cards, mobile banking, crypto, and local payment methods seamlessly.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>135+ global currencies supported</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>bKash, Nagad, Visa, Mastercard</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Badge variant="secondary" className="text-xs">Multi-Currency</Badge>
          </CardFooter>
        </Card>
      </section>

      {/* Quick Status Bar */}
      <section className="max-w-5xl mx-auto px-4 w-full">
        <div className="p-6 rounded-2xl bg-muted/40 border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-background border shadow-xs">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Shadcn & Lucide Ready</p>
              <p className="text-xs text-muted-foreground">Components installed in @/components/ui</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Ready for production integration</span>
          </div>
        </div>
      </section>
    </div>
  )
}
