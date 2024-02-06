"""init comments

Revision ID: 21dd979edd2b
Revises: 850ccab0221d
Create Date: 2024-02-06 11:37:46.508483+01:00

"""
import fastapi_users_db_sqlalchemy.generics  # noqa
import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "21dd979edd2b"
down_revision = "850ccab0221d"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "comments",
        sa.Column("id", fastapi_users_db_sqlalchemy.generics.GUID(), nullable=False),
        sa.Column("created", sa.DateTime(), nullable=False),
        sa.Column("updated", sa.DateTime(), nullable=False),
        sa.Column("user", sa.Uuid(), nullable=False),
        sa.Column(
            "obj_type", sa.Enum("seqvar", "strucvar", "gene", name="commenttypes"), nullable=False
        ),
        sa.Column("obj_id", sa.String(length=255), nullable=False),
        sa.Column("comment", sa.Text(), nullable=False),
        sa.Column("public", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["user"], ["user.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user", "obj_type", "obj_id", name="uq_comment"),
    )
    op.create_index(op.f("ix_comments_id"), "comments", ["id"], unique=False)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_comments_id"), table_name="comments")
    op.drop_table("comments")
    # ### end Alembic commands ###

    sa.Enum(name="commenttypes").drop(op.get_bind(), checkfirst=False)
