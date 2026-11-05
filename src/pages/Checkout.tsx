import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Sparkles, 
  Wallet 
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
import { Input } from '@/components/ui/input'

export default function Checkout() {
  const [method, setMethod] = useState<'card' | 'mfs' | 'wallet'>('card')
  const [paid, setPaid] = useState(false)

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> Back to Overview
          </Link>
        </Button>
        <Badge variant="outline" className="text-xs gap-1">
          <Lock className="h-3 w-3 text-emerald-500" /> 256-bit Encrypted
        </Badge>
      </div>

      <Card className="border-border shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Express Checkout</CardTitle>
              <CardDescription>Order #PGX-98241</CardDescription>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold">$129.00</span>
              <p className="text-xs text-muted-foreground">USD</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={method === 'card' ? 'default' : 'outline'}
                className="gap-2 h-auto py-2.5 flex-col items-center justify-center text-xs"
                onClick={() => setMethod('card')}
              >
                <CreditCard className="h-4 w-4" />
                <span>Card</span>
              </Button>
              <Button
                type="button"
                variant={method === 'mfs' ? 'default' : 'outline'}
                className="gap-2 h-auto py-2.5 flex-col items-center justify-center text-xs"
                onClick={() => setMethod('mfs')}
              >
                <Wallet className="h-4 w-4" />
                <span>MFS / bKash</span>
              </Button>
              <Button
                type="button"
                variant={method === 'wallet' ? 'default' : 'outline'}
                className="gap-2 h-auto py-2.5 flex-col items-center justify-center text-xs"
                onClick={() => setMethod('wallet')}
              >
                <Sparkles className="h-4 w-4" />
                <span>Crypto</span>
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          {method === 'card' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Cardholder Name</label>
                <Input placeholder="John Doe" defaultValue="Tanvir Ahmed" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium">Card Number</label>
                <Input placeholder="4111 2222 3333 4444" defaultValue="4242 •••• •••• 4242" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Expiry</label>
                  <Input placeholder="MM/YY" defaultValue="12/28" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">CVC</label>
                  <Input placeholder="123" defaultValue="888" type="password" />
                </div>
              </div>
            </div>
          )}

          {method === 'mfs' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Mobile Account Number</label>
                <Input placeholder="017XXXXXXXX" defaultValue="01812345678" />
              </div>
              <p className="text-xs text-muted-foreground">
                You will receive an OTP prompt from your provider to confirm payment.
              </p>
            </div>
          )}

          {method === 'wallet' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium">Supported Currency</label>
                <Input placeholder="USDT (TRC20 / ERC20)" defaultValue="USDT (Polygon)" readOnly />
              </div>
              <p className="text-xs text-muted-foreground">
                A dynamic smart contract deposit address will be generated upon confirmation.
              </p>
            </div>
          )}

          {paid && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Payment processed successfully! Transaction ID: #TXN-772183</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button 
            className="w-full gap-2" 
            size="lg"
            onClick={() => setPaid(true)}
          >
            <ShieldCheck className="h-4 w-4" /> Pay $129.00 USD
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">
            By proceeding, you agree to the Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
