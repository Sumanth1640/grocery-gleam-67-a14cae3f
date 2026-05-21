export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          full_name: string
          id: string
          is_default: boolean
          line1: string
          line2: string | null
          phone: string
          pincode: string
          type: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          full_name: string
          id?: string
          is_default?: boolean
          line1: string
          line2?: string | null
          phone: string
          pincode: string
          type?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          full_name?: string
          id?: string
          is_default?: boolean
          line1?: string
          line2?: string | null
          phone?: string
          pincode?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          image: string
          name: string
          slug: string
          sort_order: number
          tint: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image: string
          name: string
          slug: string
          sort_order?: number
          tint?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image?: string
          name?: string
          slug?: string
          sort_order?: number
          tint?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          created_at: string
          discount: number
          id: string
          order_id: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string
          discount?: number
          id?: string
          order_id?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string
          discount?: number
          id?: string
          order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_discount: number | null
          min_order: number
          per_user_limit: number | null
          updated_at: string
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order?: number
          per_user_limit?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_order?: number
          per_user_limit?: number | null
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: Json
          created_at: string
          delivery: number
          id: string
          items: Json
          outlet_id: string | null
          payment: string
          restaurant_id: string | null
          status: string
          subtotal: number
          total: number
          user_id: string
          warehouse_id: string | null
        }
        Insert: {
          address: Json
          created_at?: string
          delivery?: number
          id?: string
          items: Json
          outlet_id?: string | null
          payment: string
          restaurant_id?: string | null
          status?: string
          subtotal: number
          total: number
          user_id: string
          warehouse_id?: string | null
        }
        Update: {
          address?: Json
          created_at?: string
          delivery?: number
          id?: string
          items?: Json
          outlet_id?: string | null
          payment?: string
          restaurant_id?: string | null
          status?: string
          subtotal?: number
          total?: number
          user_id?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "partner_outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_dish_addons: {
        Row: {
          created_at: string
          dish_id: string
          id: string
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          dish_id: string
          id?: string
          name: string
          price: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          dish_id?: string
          id?: string
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_dish_addons_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "partner_dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_dish_variants: {
        Row: {
          created_at: string
          dish_id: string
          id: string
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          created_at?: string
          dish_id: string
          id?: string
          name: string
          price: number
          sort_order?: number
        }
        Update: {
          created_at?: string
          dish_id?: string
          id?: string
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_dish_variants_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "partner_dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_dishes: {
        Row: {
          bestseller: boolean
          created_at: string
          description: string
          id: string
          image: string
          in_stock: boolean
          mrp: number | null
          name: string
          outlet_id: string | null
          price: number
          rating: number
          restaurant_id: string
          section: string
          sort_order: number
          spicy: boolean
          updated_at: string
          veg: boolean
        }
        Insert: {
          bestseller?: boolean
          created_at?: string
          description?: string
          id?: string
          image?: string
          in_stock?: boolean
          mrp?: number | null
          name: string
          outlet_id?: string | null
          price: number
          rating?: number
          restaurant_id: string
          section?: string
          sort_order?: number
          spicy?: boolean
          updated_at?: string
          veg?: boolean
        }
        Update: {
          bestseller?: boolean
          created_at?: string
          description?: string
          id?: string
          image?: string
          in_stock?: boolean
          mrp?: number | null
          name?: string
          outlet_id?: string | null
          price?: number
          rating?: number
          restaurant_id?: string
          section?: string
          sort_order?: number
          spicy?: boolean
          updated_at?: string
          veg?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "partner_dishes_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "partner_outlets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_dishes_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "partner_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_outlets: {
        Row: {
          address: string
          area: string
          created_at: string
          eta_mins: number
          id: string
          is_active: boolean
          is_open: boolean
          lat: number | null
          lng: number | null
          name: string
          pincode: string
          restaurant_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          address?: string
          area?: string
          created_at?: string
          eta_mins?: number
          id?: string
          is_active?: boolean
          is_open?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          pincode?: string
          restaurant_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address?: string
          area?: string
          created_at?: string
          eta_mins?: number
          id?: string
          is_active?: boolean
          is_open?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          pincode?: string
          restaurant_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_outlets_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "partner_restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_restaurants: {
        Row: {
          agreement_accepted_at: string | null
          agreement_signature: string | null
          agreement_version: string | null
          area: string
          bank_account_name: string
          bank_account_number: string
          bank_ifsc: string
          bank_proof_url: string
          closes_at: string | null
          commission_rate: number
          cost_for_two: number
          cover: string
          created_at: string
          cuisines: string[]
          distance_km: number
          eta_mins: number
          fssai_doc_url: string
          fssai_expiry: string | null
          fssai_number: string
          gst_doc_url: string | null
          gst_number: string | null
          id: string
          image: string
          is_open: boolean
          name: string
          offer: string | null
          onboarding_step: number
          opens_at: string | null
          owner_email: string
          owner_id: string
          owner_name: string
          owner_phone: string
          pan_doc_url: string
          pan_number: string
          price_tier: number
          rating: number
          rejection_reason: string | null
          reviews_count: number
          shop_license_doc_url: string
          slug: string
          status: string
          updated_at: string
          veg: boolean
        }
        Insert: {
          agreement_accepted_at?: string | null
          agreement_signature?: string | null
          agreement_version?: string | null
          area?: string
          bank_account_name?: string
          bank_account_number?: string
          bank_ifsc?: string
          bank_proof_url?: string
          closes_at?: string | null
          commission_rate?: number
          cost_for_two?: number
          cover?: string
          created_at?: string
          cuisines?: string[]
          distance_km?: number
          eta_mins?: number
          fssai_doc_url?: string
          fssai_expiry?: string | null
          fssai_number?: string
          gst_doc_url?: string | null
          gst_number?: string | null
          id?: string
          image?: string
          is_open?: boolean
          name: string
          offer?: string | null
          onboarding_step?: number
          opens_at?: string | null
          owner_email?: string
          owner_id: string
          owner_name?: string
          owner_phone?: string
          pan_doc_url?: string
          pan_number?: string
          price_tier?: number
          rating?: number
          rejection_reason?: string | null
          reviews_count?: number
          shop_license_doc_url?: string
          slug: string
          status?: string
          updated_at?: string
          veg?: boolean
        }
        Update: {
          agreement_accepted_at?: string | null
          agreement_signature?: string | null
          agreement_version?: string | null
          area?: string
          bank_account_name?: string
          bank_account_number?: string
          bank_ifsc?: string
          bank_proof_url?: string
          closes_at?: string | null
          commission_rate?: number
          cost_for_two?: number
          cover?: string
          created_at?: string
          cuisines?: string[]
          distance_km?: number
          eta_mins?: number
          fssai_doc_url?: string
          fssai_expiry?: string | null
          fssai_number?: string
          gst_doc_url?: string | null
          gst_number?: string | null
          id?: string
          image?: string
          is_open?: boolean
          name?: string
          offer?: string | null
          onboarding_step?: number
          opens_at?: string | null
          owner_email?: string
          owner_id?: string
          owner_name?: string
          owner_phone?: string
          pan_doc_url?: string
          pan_number?: string
          price_tier?: number
          rating?: number
          rejection_reason?: string | null
          reviews_count?: number
          shop_license_doc_url?: string
          slug?: string
          status?: string
          updated_at?: string
          veg?: boolean
        }
        Relationships: []
      }
      product_stock: {
        Row: {
          id: string
          low_stock_threshold: number
          product_id: string
          qty: number
          updated_at: string
          warehouse_id: string
        }
        Insert: {
          id?: string
          low_stock_threshold?: number
          product_id: string
          qty?: number
          updated_at?: string
          warehouse_id: string
        }
        Update: {
          id?: string
          low_stock_threshold?: number
          product_id?: string
          qty?: number
          updated_at?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_stock_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_slug: string
          created_at: string
          eta: string
          id: string
          image: string
          in_stock: boolean
          mrp: number
          name: string
          price: number
          rating: number
          slug: string
          updated_at: string
          weight: string
        }
        Insert: {
          category_slug: string
          created_at?: string
          eta?: string
          id?: string
          image: string
          in_stock?: boolean
          mrp: number
          name: string
          price: number
          rating?: number
          slug: string
          updated_at?: string
          weight: string
        }
        Update: {
          category_slug?: string
          created_at?: string
          eta?: string
          id?: string
          image?: string
          in_stock?: boolean
          mrp?: number
          name?: string
          price?: number
          rating?: number
          slug?: string
          updated_at?: string
          weight?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string
          id: string
          rating: number
          target_id: string
          target_type: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          rating: number
          target_id: string
          target_type: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          rating?: number
          target_id?: string
          target_type?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warehouse_managers: {
        Row: {
          created_at: string
          id: string
          user_id: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_managers_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_pincodes: {
        Row: {
          created_at: string
          id: string
          pincode: string
          priority: number
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pincode: string
          priority?: number
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pincode?: string
          priority?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_pincodes_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouses: {
        Row: {
          address: string
          city: string
          code: string
          created_at: string
          id: string
          is_active: boolean
          lat: number | null
          lng: number | null
          name: string
          pincode: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          address?: string
          city?: string
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          pincode?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          pincode?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_warehouse_stock: {
        Args: { _items: Json; _warehouse_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_warehouse_manager: { Args: { _user_id: string }; Returns: boolean }
      manages_warehouse: {
        Args: { _user_id: string; _warehouse_id: string }
        Returns: boolean
      }
      owns_restaurant: {
        Args: { _restaurant_id: string; _user_id: string }
        Returns: boolean
      }
      resolve_outlet_for_restaurant: {
        Args: { _lat?: number; _lng?: number; _restaurant_id: string }
        Returns: string
      }
      resolve_warehouse_for_pincode: {
        Args: { _pincode: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "restaurant"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer", "restaurant"],
    },
  },
} as const
