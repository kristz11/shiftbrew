from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from typing import List, Optional

from .models import User, CoffeeShop, Shift, ShiftRequest, ShiftWish, WorkTimeLog
from .schemas import UserCreate, ShiftCreate, ShiftWishCreate, WorkTimeLogCreate
from .auth import get_password_hash

# User CRUD
def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=user.role,
        coffee_shop_id=user.coffee_shop_id
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_users_by_coffee_shop(db: Session, coffee_shop_id: int):
    return db.query(User).filter(User.coffee_shop_id == coffee_shop_id).all()

def update_user(db: Session, user_id: int, **kwargs):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        for key, value in kwargs.items():
            setattr(user, key, value)
        db.commit()
        db.refresh(user)
    return user

# Coffee Shop CRUD
def create_coffee_shop(db: Session, name: str, address: str):
    shop = CoffeeShop(name=name, address=address)
    db.add(shop)
    db.commit()
    db.refresh(shop)
    return shop

def get_coffee_shops(db: Session):
    return db.query(CoffeeShop).all()

# Shift CRUD
def create_shift(db: Session, shift: ShiftCreate, created_by: int):
    db_shift = Shift(
        date=shift.date,
        start_time=shift.start_time,
        end_time=shift.end_time,
        user_id=shift.user_id,
        coffee_shop_id=shift.coffee_shop_id,
        role_required=shift.role_required,
        created_by=created_by,
        is_confirmed=True
    )
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift

def get_shifts_by_user(db: Session, user_id: int):
    return db.query(Shift).filter(Shift.user_id == user_id).order_by(Shift.date).all()

def get_shifts_by_coffee_shop(db: Session, coffee_shop_id: int, start_date: datetime = None, end_date: datetime = None):
    query = db.query(Shift).filter(Shift.coffee_shop_id == coffee_shop_id)
    if start_date:
        query = query.filter(Shift.date >= start_date)
    if end_date:
        query = query.filter(Shift.date <= end_date)
    return query.order_by(Shift.date).all()

def get_shifts_by_date_range(db: Session, start_date: datetime, end_date: datetime):
    return db.query(Shift).filter(
        and_(Shift.date >= start_date, Shift.date <= end_date)
    ).all()

def delete_shift(db: Session, shift_id: int):
    shift = db.query(Shift).filter(Shift.id == shift_id).first()
    if shift:
        db.delete(shift)
        db.commit()
        return True
    return False

# Shift Request CRUD
def create_shift_request(db: Session, from_shift_id: int, to_user_id: int, requested_by: int, reason: str = None):
    request = ShiftRequest(
        from_shift_id=from_shift_id,
        to_user_id=to_user_id,
        requested_by=requested_by,
        reason=reason,
        status="pending"
    )
    db.add(request)
    db.commit()
    db.refresh(request)
    return request

def get_shift_requests_for_user(db: Session, user_id: int):
    return db.query(ShiftRequest).filter(ShiftRequest.to_user_id == user_id).all()

def update_shift_request_status(db: Session, request_id: int, status: str):
    request = db.query(ShiftRequest).filter(ShiftRequest.id == request_id).first()
    if request:
        request.status = status
        db.commit()
        db.refresh(request)
    return request

# Shift Wish CRUD
def create_shift_wish(db: Session, user_id: int, wish: ShiftWishCreate):
    db_wish = ShiftWish(
        user_id=user_id,
        date=wish.date,
        wish_type=wish.wish_type,
        comment=wish.comment
    )
    db.add(db_wish)
    db.commit()
    db.refresh(db_wish)
    return db_wish

def get_user_wishes(db: Session, user_id: int):
    return db.query(ShiftWish).filter(ShiftWish.user_id == user_id).all()

def get_wishes_for_date_range(db: Session, start_date: datetime, end_date: datetime):
    return db.query(ShiftWish).filter(
        and_(ShiftWish.date >= start_date, ShiftWish.date <= end_date)
    ).all()

# Work Time Log CRUD
def create_work_time_log(db: Session, log: WorkTimeLogCreate):
    db_log = WorkTimeLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_work_time_stats(db: Session, user_id: int, start_date: datetime, end_date: datetime):
    logs = db.query(WorkTimeLog).filter(
        and_(
            WorkTimeLog.user_id == user_id,
            WorkTimeLog.date >= start_date,
            WorkTimeLog.date <= end_date
        )
    ).all()
    
    total_hours = sum(log.hours_worked for log in logs)
    total_overtime = sum(log.overtime_hours for log in logs)
    
    return {
        "total_hours": total_hours,
        "total_overtime": total_overtime,
        "shifts_count": len(logs)
    }

def get_all_work_time_stats(db: Session, coffee_shop_id: int = None, start_date: datetime = None, end_date: datetime = None):
    query = db.query(WorkTimeLog)
    if coffee_shop_id:
        query = query.join(User).filter(User.coffee_shop_id == coffee_shop_id)
    if start_date:
        query = query.filter(WorkTimeLog.date >= start_date)
    if end_date:
        query = query.filter(WorkTimeLog.date <= end_date)
    
    logs = query.all()
    
    total_hours = sum(log.hours_worked for log in logs)
    total_overtime = sum(log.overtime_hours for log in logs)
    
    return {
        "total_hours": total_hours,
        "total_overtime": total_overtime,
        "total_shifts": len(logs),
        "average_hours_per_shift": total_hours / len(logs) if logs else 0
    }