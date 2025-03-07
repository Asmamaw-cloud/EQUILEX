"use client";

import * as z from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { courts, languages, lawyerSpecialties } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Account } from "@/server/user-management/Account";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirm: z.string().min(6, "Repeat the password"),
  phoneNumber: z
    .string()
    .regex(/^(?:\+2519\d{8}|09\d{8})$/, {
      message: "Invalid phone number format",
    })
    .nonempty("Phone number is required"),
  fullName: z.string().min(2, "Full Name must at least be 2 characters"),
  description: z.string(),
  type: z.string().min(2, "Required"),
  languages: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at leasrone language.",
  }),
  specialties: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one specialty.",
    }),
  courts: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one court.",
  }),
});

const SignUpForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [registeringUser, setRegisteringUser] = useState<boolean>(false);
  const [id, setId] = useState("");
  const [qualification, setQualification] = useState("");
  const [cv, setCv] = useState("");
  const [resume, setResume] = useState("");
  const [photo, setPhoto] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
      fullName: "",
      password: "",
      description: "",
      type: "",
      languages: ["Amharic"],
      specialties: ["criminal_law"],
      courts: ["administrative_court"],
    },
  });

  const createLawyer = useMutation({
    mutationFn: (user: any) => {
      return axios.post("", user);
    },
  });
  const createClient = useMutation({
    mutationFn: (user: any) => {
      return axios.post("/api/clients", user);
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (values.password !== values.confirm) {
      form.setError("confirm", {
        message: "Password don't match!",
      });
      return;
    }

    setRegisteringUser(true);

    if (values.type == "CLIENT") {
      createClient.mutate(
        {
          email: values.email,
          password: values.password,
          phone_number: values.phoneNumber,
          full_name: values.fullName,
        },
        {
          onSuccess: async () => {
            const res = await Account.login(values.email, values.password);
            router.push("/");
            router.refresh();
            setRegisteringUser(false);
          },
          onError: async (err: unknown) => {
            const error = err as AxiosError<{ error: string }>;
            const errorMessage = error.response?.data?.error || error.message;
          
            toast({
              title: "Couldn't create account",
              description: errorMessage,
              variant: "destructive",
            });
          },
        }
      );
    }

    if (values.type == "LAWYER") {
      createLawyer.mutate(
        {
          email: values.email,
          password: values.password,
          id,
          qualification,
          cv,
          resume,
          courts: values.courts,
          languages: values.languages,
          specialties: values.specialties,
          photo,
          description: values.description,
          phone_number: values.phoneNumber,
          full_name: values.fullName,
        },
        {
          onSuccess: async () => {
            const res = await signIn("credentials", {
              redirect: false,
              email: values.email,
              password: values.password,
            });
            if (!res?.ok) {
              {
                throw new Error("");
              }
            }
            router.push("/");
            router.refresh();
            setRegisteringUser(false);
          },
          onError: async (e) => {
            toast({
              title: "Couldn't create account!",
              description: e.message,
            });
            setRegisteringUser(false);
          },
        }
      );
    }
  }

  return (
    <div className="lg:h-screen flex items-center lg:mt-0 mt-16 justify-center px-2">
      <Card className="min-w-[450px] mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Create Account</CardTitle>
              <CardDescription className="text-[#919da0]">create new account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className=" flex flex-col lg:flex-row gap-8 ">
          <div className=" w-full ">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=" space-y-3 lg:flex gap-3 items-start "
              >
                {form.watch("type") == "LAWYER" && (
                  <ScrollArea className=" h-[80vh] p-3 rounded-md border">
                    <div className=" flex flex-col gap-8 ">
                      <div className=" flex gap-3 lg:flex-row flex-col ">
                        <div className="space-y-2 lg:w-[300px]">
                          <Label>Identification Card</Label>
                          {!id ? (
                            <UploadDropzone
                              className=" p-2 border border-gray-600 "
                              endpoint="fileUploader"
                              onClientUploadComplete={(res) => {
                                setId(res[0].url);
                              }}
                              onUploadError={(error: Error) => {
                                toast({ title: `ERROR! ${error.message}` });
                              }}
                            />
                          ) : (
                            <div className=" flex flex-col ">
                              <Image
                                src={id}
                                width={200}
                                height={200}
                                alt="cover image"
                                className=" w-[200px] h-[80px] object-cover "
                              />
                              <Button
                                onClick={() => {
                                  setId("");
                                }}
                                className=" w-[200px] "
                                variant="outline"
                              >
                                Choose Another Photo
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className=" space-y-2 lg:w-[300px]">
                          <Label>Qualification</Label>
                          {!qualification ? (
                            <UploadDropzone
                              className=" p-2 border border-gray-600 "
                              endpoint="fileUploader"
                              onClientUploadComplete={(res) => {
                                setQualification(res[0].url);
                              }}
                              onUploadError={(error) => {
                                toast({ title: `ERROR! ${error.message}` });
                              }}
                            />
                          ) : (
                            <div className=" flex flex-col ">
                              <Image
                                src={qualification}
                                width={200}
                                height={200}
                                alt="cover image"
                                className=" w-[200px] h-[80px] object-cover "
                              />
                              <Button
                                onClick={() => {
                                  setQualification("");
                                }}
                                className="w-[200px]"
                                variant="outline"
                              >
                                Choose Another Photo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className=" flex gap-3 lg:flex-row flex-col ">
                        <div className=" space-y-2 lg:w-[300px] ">
                          <Label>CV</Label>
                          {!cv ? (
                            <UploadDropzone
                              className="p-2 border border-gray-600"
                              endpoint="fileUploader"
                              onClientUploadComplete={(res) => {
                                setCv(res[0].url);
                              }}
                              onUploadError={(error: Error) => {
                                toast({ title: `ERROR! ${error.message}` });
                              }}
                            />
                          ) : (
                            <div className="flex flex-col">
                              <Image
                                src={cv}
                                width={200}
                                height={200}
                                alt="cover image"
                                className="w-[200px] h-[80px] object-cover"
                              />
                              <Button
                                onClick={() => {
                                  setCv("");
                                }}
                                className="w-[200px]"
                                variant="outline"
                              >
                                Choose Another Photo
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className=" space-y-2 lg:w-[300px] ">
                          <Label>Resume</Label>
                          {!resume ? (
                            <UploadDropzone
                              className="p-2 border border-gray-600"
                              endpoint="fileUploader"
                              onClientUploadComplete={(res) => {
                                setResume(res[0].url);
                              }}
                              onUploadError={(error: Error) => {
                                toast({ title: `ERROR! ${error.message}` });
                              }}
                            />
                          ) : (
                            <div className="flex flex-col">
                              <Image
                                src={resume}
                                width={200}
                                height={200}
                                alt="cover image"
                                className="w-[200px] h-[80px] object-cover"
                              />
                              <Button
                                onClick={() => {
                                  setResume("");
                                }}
                                className="w-[200px]"
                                variant="outline"
                              >
                                Choose Another Photo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className=" flex gap-3 lg:flex-row flex-col ">
                        <div className=" space-y-2 lg:w-[300px] ">
                          <Label>Photo</Label>
                          {!photo ? (
                            <UploadDropzone
                              className="p-2 border border-gray-600"
                              endpoint="fileUploader"
                              onClientUploadComplete={(res) => {
                                setPhoto(res[0].url);
                              }}
                              onUploadError={(error: Error) => {
                                toast({ title: `ERROR! ${error.message}` });
                              }}
                            />
                          ) : (
                            <div className="flex flex-col">
                              <Image
                                src={photo}
                                width={200}
                                height={200}
                                alt="cover image"
                                className="w-[200px] h-[80px] object-cover"
                              />
                              <Button
                                onClick={() => {
                                  setPhoto("");
                                }}
                                className="w-[200px]"
                                variant="outline"
                              >
                                Choose Another Photo
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="mt-3">About Me</FormLabel>
                          <FormControl>
                            <Textarea {...field} className="mt-3" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="languages"
                      render={() => (
                        <FormItem>
                          <div className="my-4">
                            <FormLabel className="text-base">
                              Languages
                            </FormLabel>
                            <FormDescription>
                              Select the language you speak
                            </FormDescription>
                          </div>
                          {languages.map((language) => (
                            <FormField
                              key={language.id}
                              control={form.control}
                              name="languages"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={language.id}
                                    className=" flex flex-row items-start space-x-3 space-y-0 "
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={Array.isArray(field.value) &&field.value?.includes(
                                          language.value
                                        )}
                                        onCheckedChange={(checked: any) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                language.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== language.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {language.language}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialties"
                      render={() => (
                        <FormItem>
                          <div className="my-4">
                            <FormLabel className="text-base">
                              Specialty
                            </FormLabel>
                            <FormDescription>
                              Select your specialties
                            </FormDescription>
                          </div>
                          {lawyerSpecialties.map((specialty) => (
                            <FormField
                              key={specialty.id}
                              control={form.control}
                              name="specialties"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={specialty.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={Array.isArray(field.value) &&field.value?.includes(
                                          specialty.value
                                        )}
                                        onCheckedChange={(checked: any) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                specialty.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== specialty.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {specialty.specialty}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="courts"
                      render={() => (
                        <FormItem>
                          <div className="my-4">
                            <FormLabel className="text-base">Courts</FormLabel>
                            <FormDescription>
                              Select your courts
                            </FormDescription>
                          </div>
                          {courts.map((court) => (
                            <FormField
                              key={court.id}
                              control={form.control}
                              name="courts"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={court.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={Array.isArray(field.value) &&field.value?.includes(
                                          court.value
                                        )}
                                        onCheckedChange={(checked: any) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                court.value,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value !== court.value
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal">
                                      {court.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </ScrollArea>
                )}
              </form>
              <div className=" space-y-3 ">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ''} className="lg:w-[400px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="lg:w-[400px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} className="lg:w-[400px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={"LAWYER"}>Lawyer</SelectItem>
                          <SelectItem value={"CLIENT"}>Client</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repeat Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  disabled={
                    registeringUser ||
                    (form.watch("type") == "LAWYER" &&
                      (!id || !qualification || !photo))
                  }
                  type="submit"
                  className=" w-full"
                >
                  {registeringUser && (
                    <Loader2 className=" mr-1 h-4 w-4 animate-spin " />
                  )}
                  Create
                </Button>
                <p className=" text-center text-sm ">
                  Already have an account?
                </p>
                <Button asChild className="w-full" variant="outline" >
                  <Link href={"/signin"}>Sign In</Link>
                </Button>
              </div>
            </Form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpForm;
