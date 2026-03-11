/**
 * Dummy data for the app when running without Firestore.
 * All types match the former useFirestore interfaces.
 */

export const dummyFeed = [
  { id: "f1", type: "milestone_update", actorId: "u1", actorName: "Alex Chen", description: "Shipped Phase 2 of Weather Dashboard", targetId: "p1", targetName: "Weather Dashboard", pinned: true, pinnedBy: "u1", createdAt: "2 hours ago", _createdAt: null },
  { id: "f2", type: "resource_upload", actorId: "u2", actorName: "Jordan Lee", description: "Uploaded React Patterns guide", targetId: null, targetName: null, pinned: false, pinnedBy: null, createdAt: "5 hours ago", _createdAt: null },
  { id: "f3", type: "project_complete", actorId: "u3", actorName: "Sam Rivera", description: "Marked Client Portal as complete", targetId: "p2", targetName: "Client Portal", pinned: false, pinnedBy: null, createdAt: "1 day ago", _createdAt: null },
  { id: "f4", type: "member_join", actorId: "u4", actorName: "Casey Kim", description: "Joined The Generator", targetId: null, targetName: null, pinned: false, pinnedBy: null, createdAt: "2 days ago", _createdAt: null },
  { id: "f5", type: "announcement", actorId: "u1", actorName: "E-Board", description: "Builder's Day this Friday 3–6 PM in Olin", targetId: null, targetName: null, pinned: true, pinnedBy: "u1", createdAt: "3 days ago", _createdAt: null },
];

export const dummyEvents = [
  { id: "e1", title: "Builder's Day", description: "Open lab for project work and collaboration.", date: "Mar 14, 2026", time: "3:00 PM", location: "Olin 102", type: "workshop", status: "upcoming", attendees: ["u1", "u2", "u3"], maxAttendees: 30, tags: ["build", "collab"], featured: true, createdBy: "u1", createdAt: "Mar 1, 2026" },
  { id: "e2", title: "AI & Product Talk", description: "Guest speaker on AI product development.", date: "Mar 20, 2026", time: "5:00 PM", location: "Virtual", type: "talk", status: "upcoming", attendees: ["u1"], maxAttendees: 50, tags: ["ai", "product"], featured: false, createdBy: "u1", createdAt: "Mar 2, 2026" },
  { id: "e3", title: "Buildathon Kickoff", description: "24-hour buildathon kickoff and team formation.", date: "Apr 5, 2026", time: "6:00 PM", location: "Blank Center", type: "event", status: "upcoming", attendees: [], maxAttendees: 80, tags: ["buildathon", "hackathon"], featured: true, createdBy: "u1", createdAt: "Mar 3, 2026" },
];

export const dummyMembers = [
  { id: "u1", name: "Alex Chen", email: "achen@babson.edu", role: "eboard", status: "approved", photoURL: null, standoutSkill: "Full-stack", projects: 4, uploads: 12, attendance: "95%", joinDate: "Sep 2024", linkedin: null, bio: "Builder and mentor.", skills: ["React", "Node"], openToMentorship: true },
  { id: "u2", name: "Jordan Lee", email: "jlee@babson.edu", role: "associate", status: "approved", photoURL: null, standoutSkill: "Design", projects: 2, uploads: 5, attendance: "88%", joinDate: "Jan 2025", linkedin: null, bio: null, skills: ["Figma", "UI"], openToMentorship: false },
  { id: "u3", name: "Sam Rivera", email: "srivera@babson.edu", role: "resident", status: "approved", photoURL: null, standoutSkill: "Backend", projects: 3, uploads: 2, attendance: "92%", joinDate: "Feb 2025", linkedin: null, bio: null, skills: ["Python", "APIs"], openToMentorship: true },
  { id: "u4", name: "Casey Kim", email: "ckim@babson.edu", role: "resident", status: "pending", photoURL: null, standoutSkill: "Marketing", projects: 0, uploads: 0, attendance: "—", joinDate: "Mar 2026", linkedin: null, bio: null, skills: [], openToMentorship: false },
];

export const dummyResources = [
  { id: "r1", title: "React Patterns Guide", description: "Common patterns and best practices for React at The Generator.", type: "guide", tier: "official", phase: "beginner", topics: ["React", "Frontend"], views: 42, uploadedBy: "Jordan Lee", date: "Mar 1, 2026", fileUrl: null, approved: true },
  { id: "r2", title: "Pitch Deck Template", description: "Standard template for project pitches.", type: "template", tier: "community", phase: "beginner", topics: ["Pitch"], views: 28, uploadedBy: "Alex Chen", date: "Feb 28, 2026", fileUrl: null, approved: true },
  { id: "r3", title: "API Design Notes", description: "Internal API design guidelines.", type: "guide", tier: "community", phase: "intermediate", topics: ["API", "Backend"], views: 15, uploadedBy: "Sam Rivera", date: "Feb 25, 2026", fileUrl: null, approved: false },
];

export const dummyProjects = [
  { id: "p1", name: "Weather Dashboard", description: "Real-time weather dashboard with interactive maps, built for Seven Hills Foundation.", status: "in_progress", teamMembers: [{ uid: "u1", role: "lead", name: "Alex Chen" }, { uid: "u2", role: "design", name: "Jordan Lee" }], githubUrl: "https://github.com/gen/weather", liveUrl: null, coverImage: null, gallery: [], content: "", updatedAt: "2 hours ago", createdAt: "Jan 15, 2026", clientVisible: true },
  { id: "p2", name: "Client Portal", description: "Client-facing project status and feedback portal.", status: "complete", teamMembers: [{ uid: "u1", role: "lead" }, { uid: "u3", role: "backend" }], githubUrl: null, liveUrl: "https://portal.example.com", coverImage: null, gallery: [], content: "", updatedAt: "1 day ago", createdAt: "Dec 2025", clientVisible: true },
  { id: "p3", name: "Internal Tooling", description: "Scripts and tools for club operations.", status: "ideation", teamMembers: [], githubUrl: null, liveUrl: null, coverImage: null, gallery: [], content: "", updatedAt: "1 week ago", createdAt: "Mar 1, 2026", clientVisible: false },
];

export const dummyInquiries = [
  { id: "i1", question: "How do I join The Generator?", category: "general", status: "answered", date: "Mar 5, 2026", askedBy: "prospect@email.com", reply: "Apply via the website and attend an info session. E-Board reviews applications each semester.", repliedBy: "Alex Chen" },
  { id: "i2", question: "When is the next Buildathon?", category: "events", status: "pending", date: "Mar 6, 2026", askedBy: "Anonymous", reply: null, repliedBy: null },
];

export const dummyFaq = [
  { id: "faq1", question: "How do I join The Generator?", answer: "The Generator accepts new members each semester. Reach out to E-Board or attend one of our info sessions to get started.", createdAt: "Jan 2026" },
  { id: "faq2", question: "Do I need prior coding experience?", answer: "Not at all! The Generator welcomes members of all skill levels. We have resources and workshops for complete beginners.", createdAt: "Jan 2026" },
  { id: "faq3", question: "What kind of projects does The Generator work on?", answer: "We work on a variety of projects: client work for nonprofits, internal tools, and student-led ventures. Pitch your idea and find a team.", createdAt: "Jan 2026" },
];

export const dummyActionItems = [
  { id: "a1", title: "Submit project milestone", description: "Update Phase 2 status in project dashboard.", deadline: "Mar 10, 2026", type: "form", link: "/projects", completedBy: ["u1"], createdAt: "Mar 1, 2026", createdBy: "u1" },
  { id: "a2", title: "RSVP for Builder's Day", description: "Confirm attendance for Friday session.", deadline: "Mar 14, 2026", type: "external", link: null, completedBy: [], createdAt: "Mar 2, 2026", createdBy: "u1" },
  { id: "a3", title: "Review pitch deck", description: "Feedback on internal tooling pitch.", deadline: "Mar 12, 2026", type: "form", link: null, completedBy: [], createdAt: "Mar 3, 2026", createdBy: "u1" },
];

export const dummyStartups = [
  { id: "s1", name: "Nexus Labs", description: "AI-powered workflow automation for small teams.", founders: "Alex Chen, Jordan Lee", foundedYear: "2025", website: "https://nexuslabs.example.com", createdAt: "2025" },
  { id: "s2", name: "GreenTrack", description: "Sustainability tracking for campuses.", founders: "Sam Rivera", foundedYear: "2025", website: null, createdAt: "2025" },
];

export const dummyDashboardStats = {
  totalProjects: 3,
  totalMembers: 4,
  totalResources: 2,
  activeProjects: 2,
};
