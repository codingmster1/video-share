"use server";

import { headers } from "next/headers";
import { apiFetch, doesTitleMatch, getEnv, getOrderByClause,  withErrorHandling } from "../utils";
import { auth } from "../auth";
import { BUNNY } from "@/constants";
import { user, videos } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { revalidatePath } from "next/cache";
import aj, { fixedWindow, request } from "../acrjet";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
const VIDEO_STREAM_BASE_URL = BUNNY.STREAM_BASE_URL;
const THUMBNAIL_STORAGE_BASE_URL = BUNNY.STORAGE_BASE_URL;
const THUMBNAIL_CDN_URL = BUNNY.CDN_URL;
const ACCESS_KEYS = {
    streamAccessKey: getEnv("BUNNY_STREAM_ACCESS_KEY"),
    storageAccessKey: getEnv("BUNNY_STORAGE_ACCESS_KEY"),
}
const BUNNY_LIBRARY_ID = getEnv("BUNNY_LIBRARY_ID");



const getSessionUserId = async (): Promise<string> => {
    const session = await auth.api.getSession({headers: await headers()})

    if(!session) throw new Error ('Unathenticated')

        return session.user.id;
}

const revalidatePaths = (paths: string[]) => {
paths.forEach((path) => revalidatePath(path))
}

const buildVideoWithUserQuery =() => {
    return db 
    .select({
        video: videos,
        user: {id: user.id, name: user.name,image: user.image}
    })
    .from(videos)
    .leftJoin(user, eq(videos.userId, user.id))
}

const validateWithArcjet = async (fingerPrint: string) => {
    const rateLimit = aj.withRule(
      fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 2,
        characteristics: ["fingerprint"],
      })
    );
    const req = await request();
    const decision = await rateLimit.protect(req, { fingerprint: fingerPrint });
    if (decision.isDenied()) {
      throw new Error("Rate Limit Exceeded");
    }
  };
  


export const getVideoUploadUrl = withErrorHandling(async () => {
await getSessionUserId();


const videoResponse = await apiFetch<BunnyVideoResponse>(
    `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
    {
        method: 'POST',
        bunnyType: 'stream',
        body: {title: 'Temporary title', collectionId: ''}
    }
)

const uploadUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoResponse.guid}`

return {
    videoId: videoResponse.guid,
    uploadUrl,
    accessKey: ACCESS_KEYS.streamAccessKey
}
})


export const getThumbnailUploadUrl = withErrorHandling(async (videoId: string) => {
const fileName = `${Date.now()}-${videoId}-thumbnail}`
const uploadUrl = `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${fileName}`
const cdnUrl = `${THUMBNAIL_CDN_URL}/thumbnails/${fileName}`


return {
    uploadUrl,
    cdnUrl,
    accessKey: ACCESS_KEYS.storageAccessKey
}

})


export const saveVideoDetails = withErrorHandling( async(videoDetails: VideoDetails) => {
const userId = await getSessionUserId()
await validateWithArcjet(userId);
await apiFetch(
     `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoDetails.videoId}`,
{
    method: 'POST',
    bunnyType: 'stream',
    body : {
        title: videoDetails.title,
        description: videoDetails.description,

    }
}

    )


    await db.insert(videos).values({
        title: videoDetails.title,
        description: videoDetails.description,
        videoUrl: `${BUNNY.EMBED_URL}/${BUNNY_LIBRARY_ID}/${videoDetails.videoId}`,
        videoId: videoDetails.videoId,
        thumbnailUrl: videoDetails.thumbnailUrl,
        visibility: videoDetails.visibility as "public" | "private",
        userId,
        duration: videoDetails.duration ?? null,
    })

    revalidatePaths(['/'])

    return { videoId: videoDetails.videoId}
})


export const getAllVideos = withErrorHandling(async (
    searchQuery: string = '',
    sortFilter?: string,
    pageNumber: number = 1,
    pageSize: number = 8,
) => {
const session= await auth.api.getSession({headers: await headers()})
const currentUserid = session?.user.id;


const canSeeTheVideos = or(
eq(videos.visibility, 'public'),
eq(videos.userId, currentUserid!)
)

const whereCondition = searchQuery.trim()
? and (
    canSeeTheVideos,
    doesTitleMatch(videos, searchQuery)
)
: canSeeTheVideos


const [{ totalCount }] = await db 
.select({totalCount: sql<number>`count(*)`})
.from(videos)
.where(whereCondition)


const totalVideos = Number(totalCount || 0);
const totalPages = Math.ceil(totalVideos / pageSize);


const videoRecords = await buildVideoWithUserQuery()
.where(whereCondition)
.orderBy(
    sortFilter 
    ? getOrderByClause(sortFilter)
    : sql`${videos.createdAt} DESC`
).limit(pageSize)
.offset((pageNumber - 1) * pageSize)



return {
    videos: videoRecords,
    pagination: {
currentPage: pageNumber,
totalPages,
totalVideos,
pageSize,
    }
}
})

