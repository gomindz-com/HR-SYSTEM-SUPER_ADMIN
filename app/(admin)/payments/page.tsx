// "use client"

// import { useEffect, useState } from "react"
// import { DollarSign } from "lucide-react"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { StatusBadge } from "@/components/status_badge"
// import { getPayments } from "@/lib/api"
// import type { Payment } from "@/lib/types"
// import { Skeleton } from "@/components/ui/skeleton"
// import { Button } from "@/components/ui/button"

// export default function PaymentsPage() {
//   const [payments, setPayments] = useState<Payment[]>([])
//   const [loading, setLoading] = useState(true)
//   const [page, setPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(1)
//   const [totalRevenue, setTotalRevenue] = useState(0)

//   useEffect(() => {
//     async function fetchPayments() {
//       setLoading(true)
//       const response = await getPayments({
//         page,
//         pageSize: 10,
//       })

//       if (response.success && response.data) {
//         setPayments(response.data.data)
//         setTotalPages(response.data.totalPages)

//         // Calculate total revenue from completed payments
//         const revenue = response.data.data.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0)
//         setTotalRevenue(revenue)
//       }
//       setLoading(false)
//     }
//     fetchPayments()
//   }, [page])

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
//         <p className="text-muted-foreground">View payment history and revenue</p>
//       </div>
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card className="border-border/50">
//           <CardHeader>
//             <CardTitle className="text-sm font-medium text-muted-foreground">Total Payments</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{payments.length}</div>
//           </CardContent>
//         </Card>

//         <Card className="border-border/50">
//           <CardHeader>
//             <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{payments.filter((p) => p.status === "COMPLETED").length}</div>
//           </CardContent>
//         </Card>

//         <Card className="border-border/50">
//           <CardHeader>
//             <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{payments.filter((p) => p.status === "PENDING").length}</div>
//           </CardContent>
//         </Card>
//       </div>

//       <Card className="border-border/50">
//         <CardHeader>
//           <div className="flex items-center justify-between">
//             <div>
//               <CardTitle>Payment Overview</CardTitle>
//               <CardDescription>Recent payment transactions</CardDescription>
//             </div>
//             <div className="flex items-center gap-2 text-2xl font-bold">
//               <DollarSign className="h-6 w-6 text-accent" />
//               {totalRevenue.toLocaleString()}
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="rounded-md border border-border/50">
//             <Table>
//               <TableHeader>
//                 <TableRow className="hover:bg-transparent">
//                   <TableHead>Transaction ID</TableHead>
//                   <TableHead>Company ID</TableHead>
//                   <TableHead>Amount</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Payment Date</TableHead>
//                   <TableHead>Method</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {loading ? (
//                   [...Array(5)].map((_, i) => (
//                     <TableRow key={i}>
//                       <TableCell>
//                         <Skeleton className="h-4 w-32" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-4 w-32" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-4 w-20" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-6 w-20" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-4 w-24" />
//                       </TableCell>
//                       <TableCell>
//                         <Skeleton className="h-4 w-20" />
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : payments.length === 0 ? (
//                   <TableRow>
//                     <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
//                       No payments found
//                     </TableCell>
//                   </TableRow>
//                 ) : (
//                   payments.map((payment) => (
//                     <TableRow key={payment.id}>
//                       <TableCell className="font-mono text-sm">
//                         {payment.transactionId || payment.id.slice(0, 12)}...
//                       </TableCell>
//                       <TableCell className="font-mono text-sm">{payment.companyId.slice(0, 8)}...</TableCell>
//                       <TableCell className="font-medium">
//                         {payment.currency} {payment.amount.toLocaleString()}
//                       </TableCell>
//                       <TableCell>
//                         <StatusBadge status={payment.status} />
//                       </TableCell>
//                       <TableCell className="text-muted-foreground">
//                         {new Date(payment.paymentDate).toLocaleDateString()}
//                       </TableCell>
//                       <TableCell className="text-muted-foreground">{payment.paymentMethod || "N/A"}</TableCell>
//                     </TableRow>
//                   ))
//                 )}
//               </TableBody>
//             </Table>
//           </div>

//           {!loading && totalPages > 1 && (
//             <div className="flex items-center justify-between mt-4">
//               <p className="text-sm text-muted-foreground">
//                 Page {page} of {totalPages}
//               </p>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                 >
//                   Previous
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                   disabled={page === totalPages}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


import React from 'react'

const page = () => {
  return (
    <div>
      
    </div>
  )
}

export default page

