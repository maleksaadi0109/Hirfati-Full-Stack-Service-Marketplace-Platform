import React from 'react';
import { ArrowLeft, Star, MapPin, CheckCircle, MessageCircle, Calendar, Clock, Shield } from 'lucide-react';
import Masonry from 'react-responsive-masonry';

interface ProviderProfileProps {
  providerId: string;
  onBack: () => void;
  onChatNow: (providerId: string) => void;
  onBook: (providerId: string) => void;
}

const providerData: Record<string, any> = {
  '1': {
    name: 'John Martinez',
    title: 'Licensed Plumber',
    image: 'https://images.unsplash.com/photo-1683815251677-8df20f826622?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMHBlcnNvbnxlbnwxfHx8fDE3NjcwNDY4Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 4.9,
    reviewCount: 127,
    location: 'Downtown, Los Angeles',
    hourlyRate: '$80/hr',
    yearsExperience: 15,
    jobsCompleted: 450,
    responseTime: '2 hours',
    about: 'Experienced and licensed plumber with over 15 years in the industry. I specialize in residential and commercial plumbing repairs, installations, and emergency services. My commitment is to provide high-quality work with excellent customer service. I\'m available 24/7 for emergency calls and always arrive on time with all necessary tools and equipment.',
    skills: ['Pipe Repair & Installation', 'Water Heater Services', 'Drain Cleaning', 'Emergency Repairs', 'Bathroom Remodeling', 'Leak Detection'],
    portfolio: [
      'https://images.unsplash.com/photo-1578611709914-0dda0b55f9b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHJlcGFpciUyMHdvcmt8ZW58MXx8fHwxNzY3MTAwNDAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMHJlbW9kZWxpbmd8ZW58MXx8fHwxNzY3MTA1NTE1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1749704647283-3ad79f4acc6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwcmVub3ZhdGlvbnxlbnwxfHx8fDE3NjcxMDAxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1578611709914-0dda0b55f9b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmluZyUyMHJlcGFpciUyMHdvcmt8ZW58MXx8fHwxNzY3MTAwNDAzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXRocm9vbSUyMHJlbW9kZWxpbmd8ZW58MXx8fHwxNzY3MTA1NTE1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1749704647283-3ad79f4acc6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBraXRjaGVuJTIwcmVub3ZhdGlvbnxlbnwxfHx8fDE3NjcxMDAxNTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    reviews: [
      {
        id: 1,
        name: 'Sarah Thompson',
        rating: 5,
        date: 'December 15, 2024',
        comment: 'John was fantastic! He fixed our leaking pipe quickly and professionally. Very knowledgeable and friendly. Highly recommend!',
      },
      {
        id: 2,
        name: 'Michael Chen',
        rating: 5,
        date: 'December 10, 2024',
        comment: 'Excellent service! John arrived on time and completed the bathroom renovation ahead of schedule. The quality of work is outstanding.',
      },
      {
        id: 3,
        name: 'Emily Rodriguez',
        rating: 4,
        date: 'December 5, 2024',
        comment: 'Very professional and efficient. He diagnosed and fixed our water heater issue in no time. Fair pricing too.',
      },
      {
        id: 4,
        name: 'David Park',
        rating: 5,
        date: 'November 28, 2024',
        comment: 'Best plumber I\'ve worked with. Clear communication, quality work, and reasonable rates. Will definitely hire again.',
      },
    ],
  },
  '2': {
    name: 'Sarah Johnson',
    title: 'Math & Science Tutor',
    image: 'https://images.unsplash.com/photo-1689600944138-da3b150d9cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc2NzEwNTIzMXww&ixlib=rb-4.1.0&q=80&w=1080',
    rating: 5.0,
    reviewCount: 89,
    location: 'West Side, Los Angeles',
    hourlyRate: '$50/hr',
    yearsExperience: 8,
    jobsCompleted: 320,
    responseTime: '1 hour',
    about: 'Certified educator with a Master\'s degree in Education and a passion for helping students succeed. I specialize in math and science tutoring for grades 6-12, including AP courses. My teaching approach is patient, personalized, and results-driven. I\'ve helped hundreds of students improve their grades and test scores.',
    skills: ['Algebra & Calculus', 'Physics', 'Chemistry', 'SAT/ACT Prep', 'AP Courses', 'Study Skills'],
    portfolio: [
      'https://images.unsplash.com/photo-1766330977065-4458b54c6d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwcmVub3ZhdGlvbiUyMHNlcnZpY2V8ZW58MXx8fHwxNzY3MTA1NTEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1740754699699-c8b4b1635faf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYW5keW1hbiUyMHdvcmtlcnxlbnwxfHx8fDE3NjcxMDU1MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1766330977065-4458b54c6d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwcmVub3ZhdGlvbiUyMHNlcnZpY2V8ZW58MXx8fHwxNzY3MTA1NTEyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1740754699699-c8b4b1635faf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoYW5keW1hbiUyMHdvcmtlcnxlbnwxfHx8fDE3NjcxMDU1MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
    reviews: [
      {
        id: 1,
        name: 'Jennifer Lee',
        rating: 5,
        date: 'December 20, 2024',
        comment: 'Sarah helped my daughter raise her math grade from C to A! Patient, knowledgeable, and great at explaining complex concepts.',
      },
      {
        id: 2,
        name: 'Robert Smith',
        rating: 5,
        date: 'December 12, 2024',
        comment: 'Excellent tutor! My son\'s SAT score improved by 200 points after working with Sarah for 3 months.',
      },
    ],
  },
};

export function ProviderProfile({ providerId, onBack, onChatNow, onBook }: ProviderProfileProps) {
  const provider = providerData[providerId] || providerData['1'];

  return (
    <div className="flex flex-col bg-gray-50" style={{ flex: '1 0 auto' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Back to Results</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            {/* Profile Image */}
            <div className="md:w-80 h-80 flex-shrink-0">
              <img
                src={provider.image}
                alt={provider.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Info */}
            <div className="p-8 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl text-gray-900">{provider.name}</h1>
                    <CheckCircle className="w-7 h-7 text-blue-600" />
                  </div>
                  <p className="text-xl text-gray-600 mb-3">{provider.title}</p>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-5 h-5" />
                    <span>{provider.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl text-gray-900">{provider.rating}</span>
                    </div>
                    <span className="text-gray-600">({provider.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => onChatNow(providerId)}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 justify-center"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Chat Now
                  </button>
                  <button
                    onClick={() => onBook(providerId)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 justify-center"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Now
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <div className="text-2xl text-gray-900 mb-1">{provider.hourlyRate}</div>
                  <div className="text-gray-600 text-sm">Hourly Rate</div>
                </div>
                <div>
                  <div className="text-2xl text-gray-900 mb-1">{provider.yearsExperience}+</div>
                  <div className="text-gray-600 text-sm">Years Experience</div>
                </div>
                <div>
                  <div className="text-2xl text-gray-900 mb-1">{provider.jobsCompleted}+</div>
                  <div className="text-gray-600 text-sm">Jobs Completed</div>
                </div>
                <div>
                  <div className="text-2xl text-gray-900 mb-1">{provider.responseTime}</div>
                  <div className="text-gray-600 text-sm">Response Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">{provider.about}</p>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl text-gray-900 mb-4">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-3">
                {provider.skills.map((skill: string, index: number) => (
                  <div
                    key={index}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl text-gray-900 mb-6">Portfolio</h2>
              <Masonry columnsCount={2} gutter="16px">
                {provider.portfolio.map((image: string, index: number) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer"
                  >
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </Masonry>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl text-gray-900 mb-6">Reviews ({provider.reviewCount})</h2>
              <div className="space-y-6">
                {provider.reviews.map((review: any) => (
                  <div key={review.id} className="pb-6 border-b border-gray-200 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg text-gray-900 mb-1">{review.name}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">{review.date}</span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24 space-y-6">
              <h3 className="text-xl text-gray-900 mb-4">Quick Info</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-gray-900">Response Time</div>
                    <div className="text-gray-600 text-sm">Usually responds in {provider.responseTime}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-gray-900">Availability</div>
                    <div className="text-gray-600 text-sm">7 days a week</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-gray-900">Verified Provider</div>
                    <div className="text-gray-600 text-sm">Background checked & licensed</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={() => onChatNow(providerId)}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mb-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  Start Chat
                </button>
                <button
                  onClick={() => onBook(providerId)}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mb-3 shadow-lg shadow-blue-200"
                >
                  <Calendar className="w-5 h-5" />
                  Book Now
                </button>
                <button className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Request Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
