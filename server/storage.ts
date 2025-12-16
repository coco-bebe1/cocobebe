import { type User, type InsertUser } from "../shared/schema.ts";
import { db, isDbConnected, doTablesExist, getDbError } from "./db.ts";
import { users, posts, albumPhotos, appUsers, teachers, classes, registeredChildren, siteSettings } from "../shared/schema.ts";
import { eq, and, sql } from "drizzle-orm";
import { pool } from "./db.ts";

// Data types matching client-side interfaces
export interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  type: 'notice' | 'event' | 'album' | 'board' | 'menu';
  classId?: string;
  parentId?: string;
  images?: string[];
}

export interface AlbumPhoto {
  id: number;
  url: string;
  title: string;
  date: string;
  classId?: string;
}

export interface AppUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'parent' | 'teacher' | 'nutritionist';
  child?: {
    name: string;
    age: number;
    classId: string;
    birthDate?: string;
  };
  phone?: string;
  classId?: string;
  approved: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  username: string;
  password: string;
  phone?: string;
  classId: string;
  approved: boolean;
  photoUrl?: string;
}

export interface ClassData {
  id: string;
  name: string;
  age: string;
  teacher: string;
  color: string;
  description: string;
  schedule: Array<{ time: string; activity: string }>;
}

export interface RegisteredChild {
  id: string;
  name: string;
  birthDate: string;
  classId: string;
  parentId?: string;
}

export interface SiteSettings {
  address: string;
  phone: string;
  email: string;
  mapLink: string;
  aboutDescription: string;
  history: { year: string; title: string; desc?: string }[];
  greetingTitle: string;
  greetingMessage: string;
  greetingImageUrl: string;
  greetingSignature: string;
  philosophy: { title: string; desc: string }[];
  facilityImages: { title: string; url: string; desc?: string }[];
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // App data methods
  getPosts(): Promise<Post[]>;
  addPost(post: Omit<Post, 'id' | 'date'>): Promise<Post>;
  updatePost(id: number, post: Partial<Post>): Promise<Post | null>;
  deletePost(id: number): Promise<boolean>;
  
  getAlbumPhotos(): Promise<AlbumPhoto[]>;
  addAlbumPhoto(photo: Omit<AlbumPhoto, 'id' | 'date'>): Promise<AlbumPhoto>;
  deleteAlbumPhoto(id: number): Promise<boolean>;
  
  getAppUsers(): Promise<AppUser[]>;
  addAppUser(user: Omit<AppUser, 'id'>): Promise<AppUser>;
  updateAppUser(id: string, user: Partial<AppUser>): Promise<AppUser | null>;
  deleteAppUser(id: string): Promise<boolean>;
  
  getTeachers(): Promise<Teacher[]>;
  addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher | null>;
  deleteTeacher(id: string): Promise<boolean>;
  
  getClasses(): Promise<ClassData[]>;
  addClass(cls: Omit<ClassData, 'id'>): Promise<ClassData>;
  updateClass(id: string, cls: Partial<ClassData>): Promise<ClassData | null>;
  deleteClass(id: string): Promise<boolean>;
  
  getRegisteredChildren(): Promise<RegisteredChild[]>;
  addRegisteredChild(child: Omit<RegisteredChild, 'id'>): Promise<RegisteredChild>;
  updateRegisteredChild(id: string, child: Partial<RegisteredChild>): Promise<RegisteredChild | null>;
  deleteRegisteredChild(id: string): Promise<boolean>;
  
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: SiteSettings): Promise<SiteSettings>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Posts
  async getPosts(): Promise<Post[]> {
    try {
      const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        content: row.content,
        author: row.author,
        date: row.date,
        type: row.type as Post['type'],
        classId: row.class_id || undefined,
        parentId: row.parent_id || undefined,
        images: row.images ? (typeof row.images === 'string' ? JSON.parse(row.images) : row.images) : undefined,
      }));
    } catch (error: any) {
      console.error("[Storage] Error in getPosts:", error);
      throw error;
    }
  }

  async addPost(post: Omit<Post, 'id' | 'date'>): Promise<Post> {
    const startTime = Date.now();
    try {
      console.log("[Storage] =========================================");
      console.log("[Storage] addPost START");
      console.log("[Storage] Input post:", JSON.stringify(post, null, 2));
      
      // Validate input
      if (!post.title || !post.content || !post.author || !post.type) {
        throw new Error("title, content, author, and type are required");
      }
      
      console.log("[Storage] Step 1: Getting max ID...");
      const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) as max_id FROM posts');
      const newId = parseInt(maxIdResult.rows[0]?.max_id || '0') + 1;
      console.log("[Storage] Next ID will be:", newId);
      
      const date = new Date().toISOString().split('T')[0];
      const classId = post.classId || null;
      const parentId = post.parentId || null;
      const images = post.images ? JSON.stringify(post.images) : null;
      
      console.log("[Storage] Step 2: Executing INSERT...");
      const insertResult = await pool.query(
        'INSERT INTO posts (id, title, content, author, date, type, class_id, parent_id, images) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [newId, post.title, post.content, post.author, date, post.type, classId, parentId, images]
      );
      
      const inserted = insertResult.rows[0];
      console.log("[Storage] Post inserted successfully:", inserted.id);
      
      const result = {
        id: inserted.id,
        title: inserted.title,
        content: inserted.content,
        author: inserted.author,
        date: inserted.date,
        type: inserted.type as Post['type'],
        classId: inserted.class_id || undefined,
        parentId: inserted.parent_id || undefined,
        images: inserted.images ? (typeof inserted.images === 'string' ? JSON.parse(inserted.images) : inserted.images) : undefined,
      };
      
      const duration = Date.now() - startTime;
      console.log("[Storage] Success in", duration, "ms");
      console.log("[Storage] =========================================");
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error("[Storage] =========================================");
      console.error("[Storage] ERROR in addPost after", duration, "ms");
      console.error("[Storage] Error message:", error?.message);
      console.error("[Storage] Error code:", error?.code);
      console.error("[Storage] Error detail:", error?.detail);
      console.error("[Storage] =========================================");
      
      if (error.message?.includes("does not exist") || error.message?.includes("relation") || error.code === "42P01") {
        throw new Error("데이터베이스 테이블이 존재하지 않습니다. 'npm run db:push' 명령어를 실행하여 테이블을 생성해주세요.");
      }
      if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT" || error.message?.includes("connect")) {
        throw new Error("데이터베이스에 연결할 수 없습니다. 서버 로그를 확인해주세요.");
      }
      throw new Error(`글 저장 실패: ${error.message || '알 수 없는 오류'}`);
    }
  }

  async updatePost(id: number, post: Partial<Post>): Promise<Post | null> {
    const updateData: any = {};
    if (post.title !== undefined) updateData.title = post.title;
    if (post.content !== undefined) updateData.content = post.content;
    if (post.author !== undefined) updateData.author = post.author;
    if (post.type !== undefined) updateData.type = post.type;
    if (post.classId !== undefined) updateData.classId = post.classId || null;
    if (post.parentId !== undefined) updateData.parentId = post.parentId || null;
    if (post.images !== undefined) updateData.images = post.images || null;

    const result = await db.update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();
    
    if (result.length === 0) return null;
    
    const updated = result[0];
    return {
      id: updated.id,
      title: updated.title,
      content: updated.content,
      author: updated.author,
      date: updated.date,
      type: updated.type as Post['type'],
      classId: updated.classId || undefined,
      parentId: updated.parentId || undefined,
      images: updated.images || undefined,
    };
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id)).returning();
    return result.length > 0;
  }

  // Album Photos
  async getAlbumPhotos(): Promise<AlbumPhoto[]> {
    try {
      const result = await pool.query('SELECT * FROM album_photos ORDER BY id DESC');
      return result.rows.map(row => ({
        id: row.id,
        url: row.url,
        title: row.title,
        date: row.date,
        classId: row.class_id || undefined,
      }));
    } catch (error: any) {
      console.error("[Storage] Error in getAlbumPhotos:", error);
      throw error;
    }
  }

  async addAlbumPhoto(photo: Omit<AlbumPhoto, 'id' | 'date'>): Promise<AlbumPhoto> {
    const startTime = Date.now();
    try {
      console.log("[Storage] =========================================");
      console.log("[Storage] addAlbumPhoto START");
      console.log("[Storage] Input photo:", JSON.stringify(photo, null, 2));
      
      // Validate input
      if (!photo.title || !photo.url) {
        throw new Error("title and url are required");
      }
      
      console.log("[Storage] Step 1: Getting max ID...");
      const maxIdResult = await pool.query('SELECT COALESCE(MAX(id), 0) as max_id FROM album_photos');
      console.log("[Storage] Max ID result:", maxIdResult.rows);
      const newId = parseInt(maxIdResult.rows[0]?.max_id || '0') + 1;
      console.log("[Storage] Next ID will be:", newId);
      
      const date = new Date().toISOString().split('T')[0];
      const classId = photo.classId || null;
      
      console.log("[Storage] Step 2: Preparing insert values...");
      console.log("[Storage] - id:", newId);
      console.log("[Storage] - url:", photo.url);
      console.log("[Storage] - title:", photo.title);
      console.log("[Storage] - date:", date);
      console.log("[Storage] - classId:", classId);
      
      console.log("[Storage] Step 3: Executing INSERT query...");
      const insertResult = await pool.query(
        'INSERT INTO album_photos (id, url, title, date, class_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [newId, photo.url, photo.title, date, classId]
      );
      
      console.log("[Storage] Insert result rows:", insertResult.rows.length);
      const inserted = insertResult.rows[0];
      console.log("[Storage] Inserted row:", JSON.stringify(inserted, null, 2));
      
      const result = {
        id: inserted.id,
        url: inserted.url,
        title: inserted.title,
        date: inserted.date,
        classId: inserted.class_id || undefined,
      };
      
      const duration = Date.now() - startTime;
      console.log("[Storage] Photo inserted successfully in", duration, "ms");
      console.log("[Storage] Returning:", JSON.stringify(result, null, 2));
      console.log("[Storage] =========================================");
      
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error("[Storage] =========================================");
      console.error("[Storage] ERROR in addAlbumPhoto after", duration, "ms");
      console.error("[Storage] Error type:", error?.constructor?.name);
      console.error("[Storage] Error message:", error?.message);
      console.error("[Storage] Error code:", error?.code);
      console.error("[Storage] Error detail:", error?.detail);
      console.error("[Storage] Error hint:", error?.hint);
      console.error("[Storage] Error position:", error?.position);
      console.error("[Storage] Error stack:", error?.stack);
      console.error("[Storage] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error("[Storage] =========================================");
      
      if (error.message?.includes("does not exist") || error.message?.includes("relation") || error.code === "42P01") {
        throw new Error("데이터베이스 테이블이 존재하지 않습니다. 'npm run db:push' 명령어를 실행하여 테이블을 생성해주세요.");
      }
      if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT" || error.message?.includes("connect")) {
        throw new Error("데이터베이스에 연결할 수 없습니다. 서버 로그를 확인해주세요.");
      }
      // Re-throw with more context
      throw new Error(`앨범 사진 업로드 실패: ${error.message || '알 수 없는 오류'}`);
    }
  }

  async deleteAlbumPhoto(id: number): Promise<boolean> {
    const result = await db.delete(albumPhotos).where(eq(albumPhotos.id, id)).returning();
    return result.length > 0;
  }

  // App Users
  async getAppUsers(): Promise<AppUser[]> {
    const result = await db.select().from(appUsers);
    return result.map(row => ({
      id: row.id,
      username: row.username,
      password: row.password,
      name: row.name,
      role: row.role as AppUser['role'],
      child: row.child || undefined,
      phone: row.phone || undefined,
      classId: row.classId || undefined,
      approved: row.approved,
    }));
  }

  async addAppUser(user: Omit<AppUser, 'id'>): Promise<AppUser> {
    const newUser = {
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      child: user.child || null,
      phone: user.phone || null,
      classId: user.classId || null,
      approved: user.approved,
    };
    
    const result = await db.insert(appUsers).values(newUser).returning();
    const inserted = result[0];
    return {
      id: inserted.id,
      username: inserted.username,
      password: inserted.password,
      name: inserted.name,
      role: inserted.role as AppUser['role'],
      child: inserted.child || undefined,
      phone: inserted.phone || undefined,
      classId: inserted.classId || undefined,
      approved: inserted.approved,
    };
  }

  async updateAppUser(id: string, user: Partial<AppUser>): Promise<AppUser | null> {
    const updateData: any = {};
    if (user.username !== undefined) updateData.username = user.username;
    if (user.password !== undefined) updateData.password = user.password;
    if (user.name !== undefined) updateData.name = user.name;
    if (user.role !== undefined) updateData.role = user.role;
    if (user.child !== undefined) updateData.child = user.child || null;
    if (user.phone !== undefined) updateData.phone = user.phone || null;
    if (user.classId !== undefined) updateData.classId = user.classId || null;
    if (user.approved !== undefined) updateData.approved = user.approved;

    const result = await db.update(appUsers)
      .set(updateData)
      .where(eq(appUsers.id, id))
      .returning();
    
    if (result.length === 0) return null;
    
    const updated = result[0];
    return {
      id: updated.id,
      username: updated.username,
      password: updated.password,
      name: updated.name,
      role: updated.role as AppUser['role'],
      child: updated.child || undefined,
      phone: updated.phone || undefined,
      classId: updated.classId || undefined,
      approved: updated.approved,
    };
  }

  async deleteAppUser(id: string): Promise<boolean> {
    const result = await db.delete(appUsers).where(eq(appUsers.id, id)).returning();
    return result.length > 0;
  }

  // Teachers
  async getTeachers(): Promise<Teacher[]> {
    const result = await db.select().from(teachers);
    return result.map(row => ({
      id: row.id,
      name: row.name,
      username: row.username,
      password: row.password,
      phone: row.phone || undefined,
      classId: row.classId,
      approved: row.approved,
      photoUrl: row.photoUrl || undefined,
    }));
  }

  async addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    const newTeacher = {
      name: teacher.name,
      username: teacher.username,
      password: teacher.password,
      phone: teacher.phone || null,
      classId: teacher.classId,
      approved: teacher.approved,
      photoUrl: teacher.photoUrl || null,
    };
    
    const result = await db.insert(teachers).values(newTeacher).returning();
    const inserted = result[0];
    return {
      id: inserted.id,
      name: inserted.name,
      username: inserted.username,
      password: inserted.password,
      phone: inserted.phone || undefined,
      classId: inserted.classId,
      approved: inserted.approved,
      photoUrl: inserted.photoUrl || undefined,
    };
  }

  async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<Teacher | null> {
    const updateData: any = {};
    if (teacher.name !== undefined) updateData.name = teacher.name;
    if (teacher.username !== undefined) updateData.username = teacher.username;
    if (teacher.password !== undefined) updateData.password = teacher.password;
    if (teacher.phone !== undefined) updateData.phone = teacher.phone || null;
    if (teacher.classId !== undefined) updateData.classId = teacher.classId;
    if (teacher.approved !== undefined) updateData.approved = teacher.approved;
    if (teacher.photoUrl !== undefined) updateData.photoUrl = teacher.photoUrl || null;

    const result = await db.update(teachers)
      .set(updateData)
      .where(eq(teachers.id, id))
      .returning();
    
    if (result.length === 0) return null;
    
    const updated = result[0];
    return {
      id: updated.id,
      name: updated.name,
      username: updated.username,
      password: updated.password,
      phone: updated.phone || undefined,
      classId: updated.classId,
      approved: updated.approved,
      photoUrl: updated.photoUrl || undefined,
    };
  }

  async deleteTeacher(id: string): Promise<boolean> {
    const result = await db.delete(teachers).where(eq(teachers.id, id)).returning();
    return result.length > 0;
  }

  // Classes
  async getClasses(): Promise<ClassData[]> {
    const result = await db.select().from(classes);
    return result.map(row => ({
      id: row.id,
      name: row.name,
      age: row.age,
      teacher: row.teacher,
      color: row.color,
      description: row.description,
      schedule: row.schedule,
    }));
  }

  async addClass(cls: Omit<ClassData, 'id'>): Promise<ClassData> {
    const result = await db.insert(classes).values(cls).returning();
    return result[0];
  }

  async updateClass(id: string, cls: Partial<ClassData>): Promise<ClassData | null> {
    const updateData: any = {};
    if (cls.name !== undefined) updateData.name = cls.name;
    if (cls.age !== undefined) updateData.age = cls.age;
    if (cls.teacher !== undefined) updateData.teacher = cls.teacher;
    if (cls.color !== undefined) updateData.color = cls.color;
    if (cls.description !== undefined) updateData.description = cls.description;
    if (cls.schedule !== undefined) updateData.schedule = cls.schedule;

    const result = await db.update(classes)
      .set(updateData)
      .where(eq(classes.id, id))
      .returning();
    
    if (result.length === 0) return null;
    return result[0];
  }

  async deleteClass(id: string): Promise<boolean> {
    const result = await db.delete(classes).where(eq(classes.id, id)).returning();
    return result.length > 0;
  }

  // Registered Children
  async getRegisteredChildren(): Promise<RegisteredChild[]> {
    const result = await db.select().from(registeredChildren);
    return result.map(row => ({
      id: row.id,
      name: row.name,
      birthDate: row.birthDate,
      classId: row.classId,
      parentId: row.parentId || undefined,
    }));
  }

  async addRegisteredChild(child: Omit<RegisteredChild, 'id'>): Promise<RegisteredChild> {
    const newChild = {
      name: child.name,
      birthDate: child.birthDate,
      classId: child.classId,
      parentId: child.parentId || null,
    };
    
    const result = await db.insert(registeredChildren).values(newChild).returning();
    const inserted = result[0];
    return {
      id: inserted.id,
      name: inserted.name,
      birthDate: inserted.birthDate,
      classId: inserted.classId,
      parentId: inserted.parentId || undefined,
    };
  }

  async updateRegisteredChild(id: string, child: Partial<RegisteredChild>): Promise<RegisteredChild | null> {
    const updateData: any = {};
    if (child.name !== undefined) updateData.name = child.name;
    if (child.birthDate !== undefined) updateData.birthDate = child.birthDate;
    if (child.classId !== undefined) updateData.classId = child.classId;
    if (child.parentId !== undefined) updateData.parentId = child.parentId || null;

    const result = await db.update(registeredChildren)
      .set(updateData)
      .where(eq(registeredChildren.id, id))
      .returning();
    
    if (result.length === 0) return null;
    
    const updated = result[0];
    return {
      id: updated.id,
      name: updated.name,
      birthDate: updated.birthDate,
      classId: updated.classId,
      parentId: updated.parentId || undefined,
    };
  }

  async deleteRegisteredChild(id: string): Promise<boolean> {
    const result = await db.delete(registeredChildren).where(eq(registeredChildren.id, id)).returning();
    return result.length > 0;
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    const result = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
    
    if (result.length === 0) {
      // Return default settings if none exist
      return {
        address: "서울 강서구 양천로75길 57 현대1차아파트 104동 102호",
        phone: "02-2659-7977",
        email: "yhee@naver.com",
        mapLink: "https://map.naver.com/p/search/서울 강서구 양천로75길 57",
        aboutDescription: "아이들의 꿈이 자라는 따뜻한 둥지, 코코베베어린이집입니다.",
        history: [],
        greetingTitle: "아이들의 꿈이 자라는 따뜻한 둥지",
        greetingMessage: "안녕하세요, 코코베베어린이집입니다.",
        greetingImageUrl: "",
        greetingSignature: "코코베베어린이집 박윤희 원장",
        philosophy: [],
        facilityImages: [],
      };
    }
    
    const settings = result[0];
    return {
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      mapLink: settings.mapLink,
      aboutDescription: settings.aboutDescription,
      history: settings.history,
      greetingTitle: settings.greetingTitle,
      greetingMessage: settings.greetingMessage,
      greetingImageUrl: settings.greetingImageUrl,
      greetingSignature: settings.greetingSignature,
      philosophy: settings.philosophy,
      facilityImages: settings.facilityImages,
    };
  }

  async updateSiteSettings(settings: SiteSettings): Promise<SiteSettings> {
    // Try to update first
    const updateResult = await db.update(siteSettings)
      .set({
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        mapLink: settings.mapLink,
        aboutDescription: settings.aboutDescription,
        history: settings.history,
        greetingTitle: settings.greetingTitle,
        greetingMessage: settings.greetingMessage,
        greetingImageUrl: settings.greetingImageUrl,
        greetingSignature: settings.greetingSignature,
        philosophy: settings.philosophy,
        facilityImages: settings.facilityImages,
      })
      .where(eq(siteSettings.id, 1))
      .returning();
    
    // If no rows were updated, insert instead
    if (updateResult.length === 0) {
      const insertResult = await db.insert(siteSettings).values({
        id: 1,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        mapLink: settings.mapLink,
        aboutDescription: settings.aboutDescription,
        history: settings.history,
        greetingTitle: settings.greetingTitle,
        greetingMessage: settings.greetingMessage,
        greetingImageUrl: settings.greetingImageUrl,
        greetingSignature: settings.greetingSignature,
        philosophy: settings.philosophy,
        facilityImages: settings.facilityImages,
      }).returning();
      
      const inserted = insertResult[0];
      return {
        address: inserted.address,
        phone: inserted.phone,
        email: inserted.email,
        mapLink: inserted.mapLink,
        aboutDescription: inserted.aboutDescription,
        history: inserted.history,
        greetingTitle: inserted.greetingTitle,
        greetingMessage: inserted.greetingMessage,
        greetingImageUrl: inserted.greetingImageUrl,
        greetingSignature: inserted.greetingSignature,
        philosophy: inserted.philosophy,
        facilityImages: inserted.facilityImages,
      };
    }
    
    const updated = updateResult[0];
    return {
      address: updated.address,
      phone: updated.phone,
      email: updated.email,
      mapLink: updated.mapLink,
      aboutDescription: updated.aboutDescription,
      history: updated.history,
      greetingTitle: updated.greetingTitle,
      greetingMessage: updated.greetingMessage,
      greetingImageUrl: updated.greetingImageUrl,
      greetingSignature: updated.greetingSignature,
      philosophy: updated.philosophy,
      facilityImages: updated.facilityImages,
    };
  }
}

export const storage = new DbStorage();
