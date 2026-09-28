"""Add profile personalization fields to User model

Revision ID: 002_profile_personalization
Revises: 
Create Date: 2026-09-28 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002_profile_personalization'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add nullable profile personalization columns to users table
    try:
        op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    except Exception:
        pass

    try:
        op.add_column('users', sa.Column('headline', sa.String(length=80), nullable=True))
    except Exception:
        pass

    try:
        op.add_column('users', sa.Column('interests', sa.JSON(), nullable=True))
    except Exception:
        pass

    try:
        op.add_column('users', sa.Column('links', sa.JSON(), nullable=True))
    except Exception:
        pass

    try:
        op.add_column('users', sa.Column('availability', sa.String(length=100), nullable=True))
    except Exception:
        pass

    try:
        op.add_column('users', sa.Column('favorite_quote', sa.String(length=120), nullable=True))
    except Exception:
        pass


def downgrade() -> None:
    try:
        op.drop_column('users', 'favorite_quote')
        op.drop_column('users', 'availability')
        op.drop_column('users', 'links')
        op.drop_column('users', 'interests')
        op.drop_column('users', 'headline')
        op.drop_column('users', 'avatar_url')
    except Exception:
        pass
