"""empty message

Revision ID: 315675882512
Revises:
Create Date: 2023-09-27 14:55:20.332132+02:00

"""
from alembic import op
import sqlalchemy as sa


import app.models.guid  # noqa

# revision identifiers, used by Alembic.
revision = '315675882512'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('adminmessages',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('uuid', app.models.guid.GUID(length=36), nullable=False),
    sa.Column('title', sa.String(length=255), nullable=False),
    sa.Column('text', sa.Text(), nullable=True),
    sa.Column('active_start', sa.DateTime(), nullable=False),
    sa.Column('active_stop', sa.DateTime(), nullable=False),
    sa.Column('enabled', sa.Boolean(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_adminmessages_id'), 'adminmessages', ['id'], unique=False)
    op.create_index(op.f('ix_adminmessages_uuid'), 'adminmessages', ['uuid'], unique=True)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_adminmessages_uuid'), table_name='adminmessages')
    op.drop_index(op.f('ix_adminmessages_id'), table_name='adminmessages')
    op.drop_table('adminmessages')
    # ### end Alembic commands ###