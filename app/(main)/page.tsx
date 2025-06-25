"use client";

import { useState } from "react";
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

export default function HomePage() {
  const router = useRouter();

  const [lectureQuery, setLectureQuery]   = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting]   = useState(false);

  /* ────────────────────────── helpers ────────────────────────── */

  /** Build FormData ➜ POST /lectures/start ➜ redirect */
  const handleCreateLecture = async () => {
    if (isSubmitting || !lectureQuery.trim()) return;
    try {
      setIsSubmitting(true);

      const form = new FormData();
      form.append("topic", lectureQuery.trim());
      form.append("profile_id", "1");                 // TODO: real user ID
      if (selectedCourse) form.append("course", selectedCourse);
      selectedFiles.forEach(f => form.append("files", f, f.name));

      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/lectures/start", { method: "POST", body: form });
      
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
    { icon: <Code className="w-6 h-6" />, label: "How to write a for loop in Python", bg: "bg-purple-100" },
    { icon: <Globe className="w-6 h-6" />, label: "Causes of World War I", bg: "bg-green-100" },
    { icon: <Calculator className="w-6 h-6" />, label: "The Pythagorean Theorem", bg: "bg-yellow-100" },
    { icon: <Microscope className="w-6 h-6" />, label: "How photosynthesis works", bg: "bg-teal-100" },
    { icon: <Music className="w-6 h-6" />, label: "Reading sheet music basics", bg: "bg-orange-100" },
    { icon: <Camera className="w-6 h-6" />, label: "How to take a portrait photo", bg: "bg-pink-100" },
    { icon: <Cpu className="w-6 h-6" />, label: "What is a neural network?", bg: "bg-red-100" },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
          <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="2" />
          <path d="M3 12h1M12 3v1m8 8h1m-9 8v1m6.364-14.364l-.707.707M5.636 5.636l.707.707m-.707 10.607l.707-.707m10.607.707l-.707-.707" stroke="currentColor" strokeWidth="2" />
        </svg>
      ),
      label: "Why do we dream?",
      bg: "bg-blue-100",
    },
  ];

  /* ────────────────────────── UI ─────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div className="container px-4 pt-24 mx-auto max-w-4xl">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
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
            <Input
              className="w-full py-4 px-4 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
              placeholder="Ask v0 to build..."
              value={lectureQuery}
              onChange={(e) => setLectureQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* Controls row */}
            <div className="flex items-start gap-3 mt-4 justify-between">
              {/* Course selector */}
              <Select onValueChange={(value) => setSelectedCourse(value)}>
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
              </Select>

             
              

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                {/* File picker */}
                <Button
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
                </Button>

                {/* Submit */}
                <Button
                  size="icon"
                  className="rounded-xl h-10 w-10 p-0 flex items-center justify-center bg-gray-900 text-white hover:bg-gray-800 shadow-sm hover:shadow focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  onClick={handleCreateLecture}
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular topics grid */}
        <div className="flex flex-row flex-wrap gap-3 w-full max-w-4xl mb-10 justify-center">
          {popularTopics.map((topic, index) => (
            <Card
              key={index}
              className="flex flex-row items-center gap-2 px-3 py-2 text-center cursor-pointer hover:shadow-lg transition-transform rounded-xl border border-gray-100 hover:border-gray-200 hover:scale-105 bg-white min-w-[180px] max-w-xs"
              style={{ minHeight: 0 }}
              onClick={() => {
                setLectureQuery(topic.label);
              }}
            >
              <div
                className={`w-10 h-10 ${topic.bg} rounded-full flex items-center justify-center`}
              >
                {topic.icon}
              </div>
              <span className="font-medium text-xs md:text-sm leading-tight text-left whitespace-normal">{topic.label}</span>
            </Card>
          ))}
        </div>

        {/* Community Examples (Popular Lectures) */}
      </div>
    </div>
    <div className="w-full max-w-6xl mx-auto mb-16">
      <h2 className="text-xl mb-4 font-bold text-gray-800">From the Community</h2>
      <CommunityExamples />
    </div>
  </div>
  );
}
