"""Discovery, Matching, Requests & Exchanges models

Revision ID: 001_discovery_matching_exchanges
Revises: 
Create Date: 2026-09-27 23:20:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_discovery_matching_exchanges'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create learning_requests table
    op.create_table(
        'learning_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('sender_id', sa.Integer(), nullable=False),
        sa.Column('receiver_id', sa.Integer(), nullable=False),
        sa.Column('requested_skill_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['sender_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['receiver_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['requested_skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_learning_requests_id'), 'learning_requests', ['id'], unique=False)

    # Create exchanges table (or alter if existing)
    op.create_table(
        'exchanges',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('request_id', sa.Integer(), nullable=True),
        sa.Column('teacher_id', sa.Integer(), nullable=False),
        sa.Column('learner_id', sa.Integer(), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('duration_minutes', sa.Integer(), nullable=True),
        sa.Column('credits_awarded', sa.Integer(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['request_id'], ['learning_requests.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['teacher_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['learner_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_exchanges_id'), 'exchanges', ['id'], unique=False)

    # Create feedbacks table
    op.create_table(
        'feedbacks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('exchange_id', sa.Integer(), nullable=False),
        sa.Column('from_user_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['exchange_id'], ['exchanges.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['from_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_feedbacks_id'), 'feedbacks', ['id'], unique=False)

    # Create skill_credits table
    op.create_table(
        'skill_credits',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('amount', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skill_credits_id'), 'skill_credits', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_skill_credits_id'), table_name='skill_credits')
    op.drop_table('skill_credits')
    op.drop_index(op.f('ix_feedbacks_id'), table_name='feedbacks')
    op.drop_table('feedbacks')
    op.drop_index(op.f('ix_exchanges_id'), table_name='exchanges')
    op.drop_table('exchanges')
    op.drop_index(op.f('ix_learning_requests_id'), table_name='learning_requests')
    op.drop_table('learning_requests')
