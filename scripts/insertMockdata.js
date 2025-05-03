import { supabase } from "@/lib/supabase";

async function insertMockData() {
  const freelancers = [
    {
      title: "Web Developer",
      description: "Expert in front-end and back-end development.",
      hourly_rate: 30,
      languages: ["English", "Spanish"],
      services: ["Web Development", "SEO"],
      rating: 4.5,
      reviews_count: 50,
      completed_projects: 20,
      response_time: "2 hours",
      created_at: new Date().toISOString(),
      profiles: {
        full_name: "John Doe",
        avatar_url: "https://example.com/avatar1.jpg",
      },
    },
    {
      title: "Graphic Designer",
      description: "Creative and professional graphic designer.",
      hourly_rate: 40,
      languages: ["English", "French"],
      services: ["Graphic Design", "Branding"],
      rating: 4.8,
      reviews_count: 100,
      completed_projects: 50,
      response_time: "3 hours",
      created_at: new Date().toISOString(),
      profiles: {
        full_name: "Jane Smith",
        avatar_url: "https://example.com/avatar2.jpg",
      },
    },
    {
      title: "Mobile App Developer",
      description: "Expert in Android and iOS app development.",
      hourly_rate: 50,
      languages: ["English", "German"],
      services: ["Mobile App Development", "UX/UI Design"],
      rating: 4.9,
      reviews_count: 75,
      completed_projects: 40,
      response_time: "1 hour",
      created_at: new Date().toISOString(),
      profiles: {
        full_name: "Michael Johnson",
        avatar_url: "https://example.com/avatar3.jpg",
      },
    },
  ];

  const { data, error } = await supabase
    .from("freelancers")
    .upsert(freelancers, { onConflict: ["title"] });

  if (error) {
    console.error("Error inserting mock data:", error);
  } else {
    console.log("Mock data inserted:", data);
  }
}

insertMockData();
