"""create skill profiles taxonomy and evidence tables

Revision ID: 001_skill_taxonomy_evidence
Revises: 
Create Date: 2026-09-27 23:17:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_skill_taxonomy_evidence'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. skill_categories table
    op.create_table(
        'skill_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(), nullable=True),
        sa.Column('parent_category_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['parent_category_id'], ['skill_categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skill_categories_id'), 'skill_categories', ['id'], unique=False)
    op.create_index(op.f('ix_skill_categories_name'), 'skill_categories', ['name'], unique=False)
    op.create_index(op.f('ix_skill_categories_parent_category_id'), 'skill_categories', ['parent_category_id'], unique=False)

    # 2. skills table (taxonomy)
    op.create_table(
        'skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['skill_categories.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_skills_id'), 'skills', ['id'], unique=False)
    op.create_index(op.f('ix_skills_name'), 'skills', ['name'], unique=False)
    op.create_index(op.f('ix_skills_category_id'), 'skills', ['category_id'], unique=False)

    # 3. user_skills table (claimed skills)
    op.create_table(
        'user_skills',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('skill_id', sa.Integer(), nullable=False),
        sa.Column('direction', sa.String(), nullable=False),
        sa.Column('level', sa.String(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['skill_id'], ['skills.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_user_skills_id'), 'user_skills', ['id'], unique=False)
    op.create_index(op.f('ix_user_skills_skill_id'), 'user_skills', ['skill_id'], unique=False)
    op.create_index(op.f('ix_user_skills_user_id'), 'user_skills', ['user_id'], unique=False)

    # 4. evidence table
    op.create_table(
        'evidence',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_skill_id', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('url', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('verification_state', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_skill_id'], ['user_skills.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evidence_id'), 'evidence', ['id'], unique=False)
    op.create_index(op.f('ix_evidence_user_skill_id'), 'evidence', ['user_skill_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_evidence_user_skill_id'), table_name='evidence')
    op.drop_index(op.f('ix_evidence_id'), table_name='evidence')
    op.drop_table('evidence')

    op.drop_index(op.f('ix_user_skills_user_id'), table_name='user_skills')
    op.drop_index(op.f('ix_user_skills_skill_id'), table_name='user_skills')
    op.drop_index(op.f('ix_user_skills_id'), table_name='user_skills')
    op.drop_table('user_skills')

    op.drop_index(op.f('ix_skills_category_id'), table_name='skills')
    op.drop_index(op.f('ix_skills_name'), table_name='skills')
    op.drop_index(op.f('ix_skills_id'), table_name='skills')
    op.drop_table('skills')

    op.drop_index(op.f('ix_skill_categories_parent_category_id'), table_name='skill_categories')
    op.drop_index(op.f('ix_skill_categories_name'), table_name='skill_categories')
    op.drop_index(op.f('ix_skill_categories_id'), table_name='skill_categories')
    op.drop_table('skill_categories')
