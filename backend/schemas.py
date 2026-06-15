from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class RoleEnum(str, Enum):
    MANAGER = "manager"
    ADMIN = "admin"
    BARISTA = "barista"
    TRAINEE = "trainee"

class StatusEnum(str, Enum):
    ACTIVE = "active"
    ON_VACATION = "on_vacation"
    ON_SICK_LEAVE = "on_sick_leave"
    INACTIVE = "inactive"

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: RoleEnum
    coffee_shop_id: Optional[int] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    status: Optional[StatusEnum] = None
    last_medical_exam: Optional[datetime] = None
    next_medical_exam: Optional[datetime] = None
    certification_level: Optional[int] = None

class UserResponse(UserBase):
    id: int
    status: StatusEnum
    hire_date: datetime
    last_medical_exam: Optional[datetime] = None
    next_medical_exam: Optional[datetime] = None
    certification_level: int
    last_certification_date: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Coffee Shop Schemas
class CoffeeShopBase(BaseModel):
    name: str
    address: str

class CoffeeShopCreate(CoffeeShopBase):
    pass

class CoffeeShopResponse(CoffeeShopBase):
    id: int
    
    class Config:
        from_attributes = True

# Shift Schemas
class ShiftBase(BaseModel):
    date: datetime
    start_time: datetime
    end_time: datetime
    role_required: RoleEnum
    coffee_shop_id: int

class ShiftCreate(ShiftBase):
    user_id: int

class ShiftResponse(ShiftBase):
    id: int
    user_id: int
    is_confirmed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# Shift Request Schemas
class ShiftRequestCreate(BaseModel):
    from_shift_id: int
    to_user_id: int
    reason: Optional[str] = None

class ShiftRequestResponse(BaseModel):
    id: int
    from_shift_id: int
    to_user_id: int
    requested_by: int
    status: str
    reason: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Shift Wish Schemas
class ShiftWishCreate(BaseModel):
    date: datetime
    wish_type: str
    comment: Optional[str] = None

class ShiftWishResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    wish_type: str
    comment: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Work Time Log Schemas
class WorkTimeLogCreate(BaseModel):
    user_id: int
    shift_id: int
    date: datetime
    hours_worked: float
    overtime_hours: Optional[float] = 0
    notes: Optional[str] = None

class WorkTimeLogResponse(BaseModel):
    id: int
    user_id: int
    shift_id: int
    date: datetime
    hours_worked: float
    overtime_hours: float
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str