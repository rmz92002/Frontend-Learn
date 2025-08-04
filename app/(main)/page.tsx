"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Code,
  Globe,
  Calculator,
  Microscope,
  Music,
  Camera,
  Cpu,
  Paperclip,
  ArrowUp,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PopularLectures from "@/components/popular-lectures";
import CommunityExamples from "@/components/community-examples";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function HomePage() {
  const router = useRouter();

  const [lectureQuery, setLectureQuery]   = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const { data: userDataRaw, isLoading: userLoading } = useCurrentUser()

  interface UserData {
    email?: string
    name?: string
    profile?: {
      id?: string | number
      avatar_url?: string
    }
  }
  /* ────────────────────────── helpers ────────────────────────── */
const userData = (userDataRaw && typeof userDataRaw === 'object' && 'profile' in userDataRaw)
    ? userDataRaw as UserData
    : undefined

  /** Build FormData ➜ POST /lectures/start ➜ redirect */
  const handleCreateLecture = async () => {
    if (isSubmitting || !lectureQuery.trim()) return;
    //  if (!userData) {
    //   router.push('login')
    //   return;
    // }
    try {

      setIsSubmitting(true);
      const form = new FormData();
      form.append("topic", lectureQuery.trim());
      if (userData?.profile?.id !== undefined && userData.profile.id !== null) {
         form.append("profile_id", String(userData.profile.id));
      }

          // TODO: real user ID
      if (selectedCourse) form.append("course", selectedCourse);
      selectedFiles.forEach(f => form.append("files", f, f.name));
      

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/lectures/start", { method: "POST", body: form, credentials: 'include' });
      
      if (!res.ok) throw new Error(await res.text());

      const { lecture_id } = await res.json();

      // pass the title as a convenience query param (optional) and add new = true
      // router.push(
      //   `/lectures/${lecture_id}/learn?` +
      //   `title=${encodeURIComponent(lectureQuery.trim())}&new=true`
      // );
      router.push('/lectures')
      // add new to the router 
    } catch (err) {
      console.error(err);
      alert("Could not start lecture. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCreateLecture();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  /* ────────────────────────── data (mock) ────────────────────── */
  const courses = [
    {id: "no-courses-selected", name: "No course selected"},
    { id: "learning-ali", name: "Learning ALI" },
    { id: "math-learning", name: "Math Learning" },
    { id: "doctor-marketplace", name: "Doctor Marketplace" },
    { id: "web-development", name: "Web Development" },
    { id: "data-science", name: "Data Science" },
  ];

  const popularTopics = [
    { icon: <Code className="w-6 h-6" color="gray" />, label: "How to write a for loop in Python", bg: "bg-purple-100" },
    { icon: <Globe className="w-6 h-6" color="gray" />, label: "Causes of World War I", bg: "bg-green-100" },
    { icon: <Calculator className="w-6 h-6" color="gray"/>, label: "The Pythagorean Theorem", bg: "bg-yellow-100" },
    { icon: <Microscope className="w-6 h-6" color="gray"/>, label: "How photosynthesis works", bg: "bg-teal-100" },
    { icon: <Music className="w-6 h-6" color="gray" />, label: "Reading sheet music basics", bg: "bg-orange-100" },
    { icon: <Cpu className="w-6 h-6" color="gray"/>, label: "What is a neural network?", bg: "bg-red-100" },
    
  ];

  /* ────────────────────────── UI ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div className="container px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 mx-auto max-w-4xl">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-8 sm:mb-12 text-primary">
          What do you want to learn?
        </h1>
        {selectedFiles.length > 0 && (
          <div className="w-full max-w-2xl mb-2">
            <div className="flex overflow-x-auto pb-3 gap-3 custom-scrollbar">
              {selectedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 min-w-[200px] shadow-sm hover:shadow-md transition-shadow"
                >
                  <Paperclip className="h-4 w-4 mr-2 text-gray-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {file.type.split('/')[1].toUpperCase()} • 
                      {(file.size / 1024).toFixed(1)}KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search / upload card */}
        <div className="w-full max-w-2xl mb-12">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 transition-all hover:shadow-lg">
            {/* Lecture title input */}
            <div className="flex flex-row jusftify-between items-center">
            <Input
              className="w-full py-4 px-4 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
              placeholder="I want to learn about..."
              value={lectureQuery}
              onChange={(e) => setLectureQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />


              <div className="flex gap-2 shrink-0">
      
                {/* File picker */}
                {/* <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-xl h-10 w-10 p-0 flex items-center justify-center shadow-sm hover:shadow focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    multiple
                    onChange={handleFileChange}
                  />
                  <Paperclip className="h-5 w-5 text-gray-700" />
                </Button> */}

                {/* Submit */}
                <Button
                  size="icon"
                  className="rounded-xl h-10 w-10 p-0 flex items-center justify-center text-white shadow-sm hover:shadow focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  onClick={handleCreateLecture}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>

            </div>
            

            {/* Controls row */}
            <div className="flex items-start gap-3 mt-4 justify-between">
              {/* Course selector */}
              {/* <Select onValueChange={(value) => setSelectedCourse(value)}>
                <SelectTrigger className="w-56 shrink-0 border-0 bg-gray-100 text-gray-700 focus:ring-0 rounded-lg">
                  <SelectValue placeholder="No course selected" />
                </SelectTrigger>
                <SelectContent>
                  
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}

             
              

              {/* Actions */}
              
            </div>
          </div>
        </div>

        {/* Popular topics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-4xl mb-10">
          {popularTopics.map((topic, index) => (
            <Card
              key={index}
              className="flex flex-row bg-secondary items-center gap-2 px-3 py-2 text-center cursor-pointer hover:shadow-lg transition-transform rounded-xl border border-gray-100 hover:border-gray-200 hover:scale-105"
              style={{ minHeight: 'auto' }}
              onClick={() => {
                setLectureQuery(topic.label);
              }}
            >
              <div
                className={`w-10 h-10  rounded-full flex items-center justify-center`}
              >
                {topic.icon}
              </div>
              <span className="font-medium text-xs md:text-sm leading-tight text-left whitespace-normal text-gray-700">{topic.label}</span>
            </Card>
          ))}
        </div>

        {/* Community Examples (Popular Lectures) */}
      </div>
    </div>
    <div className="w-full max-w-6xl mx-auto mb-16 px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl sm:text-3xl mb-6 font-bold text-gray-800">From the Community</h2>
      <PopularLectures userData={userData} />
    </div>
  </div>
  );
}
