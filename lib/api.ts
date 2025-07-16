export async function getCurrentUser(signal?: AbortSignal) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
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

/**
 * Fetch how many free‑tier lecture generations this anonymous visitor
 * still has available. Relies on the `client_id` cookie automatically
 * sent with `credentials:"include"`.
 *
 * Example response:
 *   { "remaining_generations": 3 }
 */
export async function getRemainingGenerations(
  signal?: AbortSignal
): Promise<{ remaining_generations: number }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/lectures/generations_left`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      signal,
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch remaining generations: ${response.status}`
    );
  }

  return response.json();
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
  opts: { isNew: boolean; page?: number, profileId?: number },
  signal?: AbortSignal
) {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/stream`
  );

  if (!opts.isNew && opts.page !== undefined) {
    url.searchParams.set("page", String(opts.page));
  }
  if (typeof opts.profileId === "number") {
    url.searchParams.set("profile_id", String(opts.profileId));
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profiles/me`, {
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
  liked: boolean
  likes: number
  saved: boolean
  profile: any
  comment_count: number
  course: any
  course_id: any
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

export async function likeLecture(
  lectureId: string,
  profileId: number,
  like: boolean = true,
  signal?: AbortSignal
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/like`);
  url.searchParams.set('profile_id', String(profileId));
  url.searchParams.set('like', String(like));

  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to like/unlike lecture: ${response.status}`);
  }

  return response.json();
}

export async function saveLecture(
  lectureId: string,
  profileId: number,
  save: boolean = true,
  signal?: AbortSignal
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/save`);
  url.searchParams.set('profile_id', String(profileId));
  url.searchParams.set('save', String(save));

  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to save/unsave lecture: ${response.status}`);
  }

  return response.json();
}



export async function getSavedLectures(
  profileId?: number | null,
  page: number = 1,
  pageSize: number = 10,
  signal?: AbortSignal
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/saved`);
  if (typeof profileId === "number") {
    url.searchParams.set("profile_id", String(profileId));
  }
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(pageSize));

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch saved lectures: ${response.status}`);
  }

  return response.json();
}

export async function getLectureComments(
  lectureId: string,
  page: number = 1,
  pageSize: number = 10,
  profile_id?: number,
  signal?: AbortSignal
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/comments`);
  url.searchParams.set('page', String(page));
  if (profile_id) {
    url.searchParams.set('profile_id', String(profile_id));
  }
  url.searchParams.set('page_size', String(pageSize));

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch lecture comments: ${response.status}`);
  }

  return response.json();
}

export async function createLectureComment(
  lectureId: string,
  profileId: number,
  content: string,
  parentId?: number,
  signal?: AbortSignal
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/comments`);
  const body: Record<string, any> = {
    profile_id: profileId,
    content,
  };
  if (parentId !== undefined) {
    body.parent_id = parentId;
  }

  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to create comment: ${response.status}`);
  }

  return response.json();
}

export async function getCommentReplies(
  commentId: number,
  page: number = 1,
  pageSize: number = 10,
  signal?: AbortSignal
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/comments/${commentId}/replies`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(pageSize));

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch comment replies: ${response.status}`);
  }

  return response.json();
}

export async function likeComment(
  commentId: number,
  profileId: number,
  like: boolean = true,
  signal?: AbortSignal
) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/comments/${commentId}/like`);
  url.searchParams.set('profile_id', String(profileId));
  url.searchParams.set('like', String(like));

  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to like/unlike comment: ${response.status}`);
  }

  return response.json();
}

export interface TrendingLecture {
  html_content: string
  title: string;
  description?: string;
  date: string;
  category: string;
  lecture_id: string;
  likes: number;
  comments_count: number;
  // Optionally add: like_count?: number;
}

export async function getTrendingLectures(signal?: AbortSignal): Promise<TrendingLecture[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/trending`);
  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch trending lectures: ${response.status}`);
  }
  return response.json();
}

export async function getPopularLectures(
  page: number = 1,
  pageSize: number = 12,
  signal?: AbortSignal
): Promise<TrendingLecture[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/popular`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(pageSize));
  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch popular lectures: ${response.status}`);
  }
  return response.json();
}

export async function searchLecturesSemantic(
  q: string,
  topK: number = 12,
  page: number = 1,
  signal?: AbortSignal
): Promise<TrendingLecture[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/search_semantic`);
  url.searchParams.set('q', q);
  url.searchParams.set('top_k', String(topK));
  url.searchParams.set('page', String(page)); // Add page parameter for pagination
  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to search lectures semantically: ${response.status}`);
  }
  return response.json();
}

export async function getRecentlyViewedLectures(
  profileId?: number | null,
  page: number = 1,
  pageSize: number = 12,
  signal?: AbortSignal
): Promise<LectureInProgress[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/recently_viewed`);
  if (typeof profileId === "number") {
    url.searchParams.set("profile_id", String(profileId));
  }
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(pageSize));
  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch recently viewed lectures: ${response.status}`);
  }
  return response.json();
}

export async function chatWithLecture(
  lectureId: string,
  slideIndex: number,
  question: string,
  onStream?: (data: { answer?: string; slide_update?: { slide_index: number; new_html: string | null } }) => void,
  signal?: AbortSignal
): Promise<string> {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/lectures/${lectureId}/chat/${slideIndex}`);
  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Failed to get chat answer: ${response.status}`);
  }

  // Streaming response handling
  if (onStream) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let answer = '';
    let buffer = '';
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      // Handle event:slide_update
      let eventIdx;
      while ((eventIdx = buffer.indexOf('event:slide_update')) !== -1) {
        const dataIdx = buffer.indexOf('data:', eventIdx);
        const endIdx = buffer.indexOf('\n\n', dataIdx);
        if (dataIdx !== -1 && endIdx !== -1) {
          const jsonStr = buffer.slice(dataIdx + 5, endIdx).trim();
          try {
            const slide_update = JSON.parse(jsonStr);
            onStream({ slide_update });
          } catch {}
          buffer = buffer.slice(endIdx + 2);
        } else {
          break;
        }
      }
      // Stream normal text
      const parts = buffer.split('event:slide_update');
      if (parts.length > 1) {
        answer += parts[0];
        onStream({ answer: answer });
        buffer = buffer.slice(parts[0].length);
      } else {
        answer += buffer;
        onStream({ answer });
        buffer = '';
      }
    }
    return answer;
  } else {
    // If not streaming, just return the full text
    return response.text();
  }
}
