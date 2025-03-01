'use client'

import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react";

import * as z from "zod"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Account } from "@/server/user-management/account";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
    email: z.string().email({
        message: "Invalid email address"
    }),
    password: z.string().min(6, "Password must be at least 6 characters")
})


const RegistrationForm = () => {

    const { toast } = useToast()
    const router = useRouter()
    // const { data: session } = useSession()

    let tempUserInfo: any;
    const [registeringUser, setRegisteringUser] = useState<boolean>(false)
    if (typeof window !== "undefined") {
      tempUserInfo = JSON.parse(localStorage.getItem("tempUserInfo") || "{}")
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          password: "",
        },
      });

      async function onSubmit(values: z.infer<typeof formSchema>) {
         try {
            setRegisteringUser(true);
            const res = await Account.login(values.email, values.password)
            router.push("/")
            router.refresh()
         } catch(err: any) {
            return toast({
              title: "Coundn't log you in.",
              description: "Please check the credentials you provided.",
              variant: "destructive",
              duration: 3000,
            })
         } finally {
          setRegisteringUser(false)
         }
      }

  return (
    <div className="h-screen flex items-center justify-center px-2">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Sign Into Your Account</CardTitle>
              <CardDescription>Sign in to get access</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField 
                control={form.control}
                name="email"
                render={({field}) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
              />
              <FormField 
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input {...field} type="password"/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
              )}
               />
              <Button 
              disabled = {registeringUser}
              type="submit"
              className="w-full"
              >
                {
                  registeringUser && (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin"/>
                  )
                }
                Sign In
              </Button>
              <p className="text-center text-sm">Don&apos;t have an account?</p>
              <Button asChild className="w-full" variant="outline">
                <Link href={"/signup"}>Create Account</Link>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationForm;
