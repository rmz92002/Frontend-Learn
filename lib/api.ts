export async function getCurrentUser(signal?: AbortSignal) {
  const res = await fetch("http://localhost:8000/auth/me", {
    signal,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  })

  if (res.status === 401) {
    // not logged in
    return null                    // <-  ❗️return, don’t throw
  }

  if (!res.ok) {
    throw new Error("Failed to fetch user")
  }

  return res.json() 
}

  // get lecutre

  export async function getLecture(lectureId: string, isNew: boolean, pageNumber: number, signal?: AbortSignal) {
    if (isNew) {
     return fetch(`${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/stream`, {
      method: "GET",
      mode: "cors", 
      headers: {
        //event stream
        "Content-Type": "text/event-stream",
      },
      signal
    })
    } else {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/stream?page=${pageNumber}`, {
        method: "GET",
        mode: "cors", 
        headers: {
          //event stream
          "Content-Type": "text/event-stream",
        },
        signal
      })
    }
  }

  // lib/api.ts
export async function streamLecture(
  lectureId: string,
  opts: { isNew: boolean; page?: number },
  signal?: AbortSignal
) {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/stream`
  );

  if (!opts.isNew && opts.page !== undefined) {
    url.searchParams.set("page", String(opts.page));
  }

  return fetch(url.toString(), {
    method: "GET",
    mode: "cors",
    credentials: "include",
    headers: { Accept: "text/event-stream" },
    signal,
  });
}


  // get settings 

  export async function getSettingsUser(signal?: AbortSignal) {
    const response = await fetch('http://localhost:8000/profiles/me', {
      signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch settings')
    }
    
    return response.json()
  }

// update settings
export async function updateSettingsUser(
    settings: Partial<{
      name: string
      email: string
      phone: string
      bio: string
      email_notifications: boolean
      push_notifications: boolean
      dark_mode: boolean
      public_profile: boolean
      language: string
      timezone: string
    }>,
    signal?: AbortSignal
  ) {
    const response = await fetch('http://localhost:8000/profiles/me', {
      method: 'PUT',
      signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })
  
    if (!response.ok) {
      throw new Error('Failed to update settings')
    }
  
    return response.json()
  }



export interface LectureInProgress {
  title: string;
  description?: string;
  progress: number;
  date: string;      // ISO 8601 timestamp
  category: string;
  lecture_id: string;
}
export async function getLecturesInProgress(
  profileId: number,
  page = 1,
  pageSize = 10,
  signal?: AbortSignal
): Promise<LectureInProgress[]> {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/lectures`
  );
  url.searchParams.set("profile_id", `${profileId}`);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(pageSize));
  console.log("→ fetching lectures:", url.toString());


  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  });

  console.log("→ fetching lectures:", url.toString());


  if (!response.ok) {
    throw new Error(`Failed to fetch lectures: ${response.status}`);
  }
  
 
  return response.json();
}

export async function getLectureById(
  lectureId: string,
  signal?: AbortSignal
): Promise<LectureInProgress> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}`,
    {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch lecture: ${response.status}`);
  }

  return response.json();
}
