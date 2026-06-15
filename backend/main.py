from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from database import engine, get_db, Base
from models import User, RoleEnum
from schemas import (
    UserCreate, UserResponse, UserUpdate, UserLogin,
    CoffeeShopCreate, CoffeeShopResponse,
    ShiftCreate, ShiftResponse,
    ShiftRequestCreate, ShiftRequestResponse,
    ShiftWishCreate, ShiftWishResponse,
    WorkTimeLogCreate, WorkTimeLogResponse,
    Token
)
import crud
import auth
from auth import get_current_user, get_current_manager, authenticate_user, create_access_token

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShiftBrew API", description="Schedule Management System for Coffee Shops")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth endpoints
@app.post("/token", response_model=Token)
async def login_for_access_token(login: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, login.email, login.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.put("/users/me", response_model=UserResponse)
async def update_user_me(user_update: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.update_user(db, current_user.id, **user_update.dict(exclude_unset=True))

# Coffee Shop endpoints
@app.post("/coffee-shops", response_model=CoffeeShopResponse)
async def create_coffee_shop(shop: CoffeeShopCreate, current_user: User = Depends(get_current_manager), db: Session = Depends(get_db)):
    return crud.create_coffee_shop(db, name=shop.name, address=shop.address)

@app.get("/coffee-shops", response_model=List[CoffeeShopResponse])
async def get_coffee_shops(db: Session = Depends(get_db)):
    return crud.get_coffee_shops(db)

# Shift endpoints
@app.post("/shifts", response_model=ShiftResponse)
async def create_shift(shift: ShiftCreate, current_user: User = Depends(get_current_manager), db: Session = Depends(get_db)):
    return crud.create_shift(db=db, shift=shift, created_by=current_user.id)

@app.get("/shifts/my", response_model=List[ShiftResponse])
async def get_my_shifts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_shifts_by_user(db, user_id=current_user.id)

@app.get("/shifts/coffee-shop/{shop_id}", response_model=List[ShiftResponse])
async def get_coffee_shop_shifts(shop_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role.value not in ["manager", "admin"] and current_user.coffee_shop_id != shop_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return crud.get_shifts_by_coffee_shop(db, coffee_shop_id=shop_id)

@app.delete("/shifts/{shift_id}")
async def delete_shift(shift_id: int, current_user: User = Depends(get_current_manager), db: Session = Depends(get_db)):
    if crud.delete_shift(db, shift_id):
        return {"message": "Shift deleted successfully"}
    raise HTTPException(status_code=404, detail="Shift not found")

# Shift Request endpoints
@app.post("/shift-requests", response_model=ShiftRequestResponse)
async def create_shift_request(request: ShiftRequestCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_shift_request(
        db=db,
        from_shift_id=request.from_shift_id,
        to_user_id=request.to_user_id,
        requested_by=current_user.id,
        reason=request.reason
    )

@app.get("/shift-requests/my", response_model=List[ShiftRequestResponse])
async def get_my_shift_requests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_shift_requests_for_user(db, user_id=current_user.id)

@app.put("/shift-requests/{request_id}/{status}")
async def update_request_status(request_id: int, status: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if status not in ["pending", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    return crud.update_shift_request_status(db, request_id, status)

# Shift Wish endpoints
@app.post("/shift-wishes", response_model=ShiftWishResponse)
async def create_shift_wish(wish: ShiftWishCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.create_shift_wish(db=db, user_id=current_user.id, wish=wish)

@app.get("/shift-wishes/my", response_model=List[ShiftWishResponse])
async def get_my_wishes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_user_wishes(db, user_id=current_user.id)

# Work Time endpoints
@app.post("/work-time", response_model=WorkTimeLogResponse)
async def create_work_time(log: WorkTimeLogCreate, current_user: User = Depends(get_current_manager), db: Session = Depends(get_db)):
    return crud.create_work_time_log(db=db, log=log)

@app.get("/work-time/my-stats")
async def get_my_stats(
    start_date: datetime,
    end_date: datetime,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_work_time_stats(db, user_id=current_user.id, start_date=start_date, end_date=end_date)

@app.get("/work-time/stats")
async def get_all_stats(
    coffee_shop_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_manager),
    db: Session = Depends(get_db)
):
    return crud.get_all_work_time_stats(db, coffee_shop_id=coffee_shop_id, start_date=start_date, end_date=end_date)

# Health check
@app.get("/")
async def root():
    return {"message": "ShiftBrew API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}