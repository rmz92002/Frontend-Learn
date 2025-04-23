import { HelpCircle, Book, MessageCircle, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function HelpPage() {
  const helpCategories = [
    {
      title: "Getting Started",
      icon: <Book className="h-6 w-6" />,
      description: "Learn the basics of using the LearnAll platform",
      link: "/help/getting-started",
    },
    {
      title: "Contact Support",
      icon: <MessageCircle className="h-6 w-6" />,
      description: "Get in touch with our support team",
      link: "/help/contact",
    },
    {
      title: "FAQs",
      icon: <HelpCircle className="h-6 w-6" />,
      description: "Find answers to commonly asked questions",
      link: "/help/faqs",
    },
    {
      title: "Documentation",
      icon: <FileText className="h-6 w-6" />,
      description: "Detailed guides and documentation",
      link: "/help/docs",
    },
  ]

  const faqs = [
    {
      question: "How do I create a new lecture?",
      answer:
        "To create a new lecture, click on the 'New Lecture' button in the sidebar, then follow the prompts to add content and specify which course it belongs to.",
    },
    {
      question: "Can I download lectures for offline viewing?",
      answer:
        "Yes, you can download lectures by clicking the download icon on any lecture page. Downloaded lectures will be available in your 'Saved Lectures' section.",
    },
    {
      question: "How do I track my progress?",
      answer:
        "Your progress is automatically tracked as you complete lectures. You can view your overall progress in your profile page and course-specific progress on each course page.",
    },
    {
      question: "Can I collaborate with others on lectures?",
      answer:
        "Yes, you can invite others to collaborate on your lectures by sharing the lecture link and granting them edit permissions from the lecture settings.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Help & Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {helpCategories.map((category, index) => (
          <Link
            href={category.link}
            key={index}
            className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-start"
          >
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">{category.icon}</div>
            <div>
              <h3 className="text-lg font-medium">{category.title}</h3>
              <p className="text-gray-600 mt-1">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
      <div className="bg-white rounded-lg shadow divide-y">
        {faqs.map((faq, index) => (
          <div key={index} className="p-6">
            <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
            <p className="mt-2 text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Still need help?</h2>
        <p className="text-gray-600 mb-4">
          Our support team is available 24/7 to assist you with any questions or issues.
        </p>
        <Link
          href="/help/contact"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Contact Support
          <ExternalLink className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

