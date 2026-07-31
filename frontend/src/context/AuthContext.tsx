import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface UserProfile {
  id: string
  display_name: string
  email: string
  default_tier: 'beginner' | 'advanced'
  favorite_exercise: string
  created_at?: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: UserProfile | null
  isAuthenticated: boolean
  loading: boolean
  authError: string | null
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>
  clearError: () => void
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'demo_user_1',
  display_name: 'Alex Vance',
  email: 'alex.vance@flexion.fit',
  default_tier: 'advanced',
  favorite_exercise: 'squat',
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    if (!isSupabaseConfigured) return DEFAULT_PROFILE
    return null
  })
  const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)
  const [authError, setAuthError] = useState<string | null>(null)

  // Fetch or sync user profile from Supabase 'profiles' table
  const fetchProfile = async (userId: string, userEmail?: string, metaName?: string) => {
    if (!isSupabaseConfigured) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.warn('[Flexion Auth] Profile fetch warning:', error.message)
      }

      if (data) {
        setProfile({
          id: data.id,
          display_name: data.display_name || metaName || 'Athlete',
          email: userEmail || '',
          default_tier: data.default_tier || 'advanced',
          favorite_exercise: data.favorite_exercise || 'squat',
          created_at: data.created_at,
        })
      } else {
        // Fallback create profile if trigger has not executed
        const newProf: UserProfile = {
          id: userId,
          display_name: metaName || userEmail?.split('@')[0] || 'Athlete',
          email: userEmail || '',
          default_tier: 'advanced',
          favorite_exercise: 'squat',
        }
        await supabase.from('profiles').upsert({
          id: userId,
          display_name: newProf.display_name,
          default_tier: newProf.default_tier,
          favorite_exercise: newProf.favorite_exercise,
        })
        setProfile(newProf)
      }
    } catch (err) {
      console.warn('[Flexion Auth] Error loading profile:', err)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email, session.user.user_metadata?.display_name)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email, session.user.user_metadata?.display_name)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName?: string) => {
    setAuthError(null)
    if (!isSupabaseConfigured) {
      // Development Fallback
      setProfile({
        id: `usr_${Date.now()}`,
        display_name: displayName || email.split('@')[0] || 'Athlete',
        email,
        default_tier: 'advanced',
        favorite_exercise: 'squat',
      })
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    })

    if (error) {
      setAuthError(error.message)
      throw error
    }

    if (data.user) {
      await fetchProfile(data.user.id, email, displayName)
    }
  }

  const signIn = async (email: string, password: string) => {
    setAuthError(null)
    if (!isSupabaseConfigured) {
      // Development Fallback
      setProfile({
        id: `usr_${Date.now()}`,
        display_name: email.split('@')[0] || 'Athlete',
        email,
        default_tier: 'advanced',
        favorite_exercise: 'squat',
      })
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setAuthError(error.message)
      throw error
    }

    if (data.user) {
      await fetchProfile(data.user.id, email)
    }
  }

  const signOut = async () => {
    setAuthError(null)
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    setAuthError(null)
    if (profile) {
      const updatedProfile = { ...profile, ...updates }
      setProfile(updatedProfile)

      if (isSupabaseConfigured && user) {
        const { error } = await supabase
          .from('profiles')
          .update({
            display_name: updatedProfile.display_name,
            default_tier: updatedProfile.default_tier,
            favorite_exercise: updatedProfile.favorite_exercise,
          })
          .eq('id', user.id)

        if (error) {
          console.warn('[Flexion Auth] Update profile failed:', error.message)
          setAuthError(error.message)
        }
      }
    }
  }

  const clearError = () => setAuthError(null)

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isAuthenticated: isSupabaseConfigured ? !!session : !!profile,
        loading,
        authError,
        signUp,
        signIn,
        signOut,
        updateProfileData,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
