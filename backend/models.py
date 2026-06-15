from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Enum, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class RoleEnum(str, enum.Enum):
    MANAGER = "manager"
    ADMIN = "admin"
    BARISTA = "barista"
    TRAINEE = "trainee"

class StatusEnum(str, enum.Enum):
    ACTIVE = "active"
    ON_VACATION = "on_vacation"
    ON_SICK_LEAVE = "on_sick_leave"
    INACTIVE = "inactive"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)  # bcrypt создаёт хеш длиной 60 символов
    full_name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    coffee_shop_id = Column(Integer, ForeignKey("coffee_shops.id"), nullable=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.ACTIVE)
    hire_date = Column(DateTime, default=func.now())
    
    # Medical and certification
    last_medical_exam = Column(DateTime, nullable=True)
    next_medical_exam = Column(DateTime, nullable=True)
    certification_level = Column(Integer, default=1)
    last_certification_date = Column(DateTime, nullable=True)
    
    # Relationships
    shifts = relationship("Shift", back_populates="user", foreign_keys="Shift.user_id")
    shift_requests = relationship(
    "ShiftRequest",
    foreign_keys="ShiftRequest.requested_by"
)
    wishes = relationship("ShiftWish", back_populates="user")
    coffee_shop = relationship("CoffeeShop", back_populates="employees")

class CoffeeShop(Base):
    __tablename__ = "coffee_shops"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    
    employees = relationship("User", back_populates="coffee_shop")
    shifts = relationship("Shift", back_populates="coffee_shop")

class Shift(Base):
    __tablename__ = "shifts"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    coffee_shop_id = Column(Integer, ForeignKey("coffee_shops.id"), nullable=False)
    role_required = Column(Enum(RoleEnum), nullable=False)
    is_confirmed = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    user = relationship("User", back_populates="shifts", foreign_keys=[user_id])
    coffee_shop = relationship("CoffeeShop", back_populates="shifts")
    creator = relationship("User", foreign_keys=[created_by])

class ShiftRequest(Base):
    __tablename__ = "shift_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    from_shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requested_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="pending")  # pending, approved, rejected
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    from_shift = relationship("Shift", foreign_keys=[from_shift_id])
    to_user = relationship("User", foreign_keys=[to_user_id])
    requester = relationship("User", foreign_keys=[requested_by])

class ShiftWish(Base):
    __tablename__ = "shift_wishes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    wish_type = Column(String)  # "available", "unavailable", "prefer_morning", "prefer_evening"
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    user = relationship("User", back_populates="wishes")

class WorkTimeLog(Base):
    __tablename__ = "work_time_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    shift_id = Column(Integer, ForeignKey("shifts.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    hours_worked = Column(Float, nullable=False)
    overtime_hours = Column(Float, default=0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=func.now())
    
    user = relationship("User")
    shift = relationship("Shift")