
"""Farm alert endpoints.

This route returns alerts that have actually been stored in the database.
It does not generate placeholder warnings or infer risks from missing data.
"""

import json
import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Alert, Farm
from ..schemas import AlertItem

logger = logging.getLogger("field_shift.alerts")

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


def _read_translation_json(value: str, field_name: str) -> Dict[str, str]:
    """Parse a stored multilingual JSON field without inventing content."""
    if not value:
        return {}

    try:
        parsed: Any = json.loads(value)
    except (TypeError, json.JSONDecodeError) as exc:
        logger.error("Invalid JSON in stored alert field '%s'", field_name)
        raise HTTPException(
            status_code=500,
            detail="A stored alert contains invalid data.",
        ) from exc

    if not isinstance(parsed, dict):
        logger.error("Stored alert field '%s' is not a JSON object", field_name)
        raise HTTPException(
            status_code=500,
            detail="A stored alert contains invalid data.",
        )

    return {
        str(language): str(message)
        for language, message in parsed.items()
        if isinstance(language, str) and isinstance(message, str)
    }


@router.get("/{farm_id}", response_model=List[AlertItem])
def get_farm_alerts(
    farm_id: int,
    db: Session = Depends(get_db),
):
    """Return saved alerts for an existing farm.

    An empty list means no alerts have been stored. It does not mean
    that the farm has been checked and found to be risk-free.
    """

    farm = db.query(Farm).filter(Farm.id == farm_id).first()

    if farm is None:
        raise HTTPException(
            status_code=404,
            detail="Farm not found.",
        )

    records = (
        db.query(Alert)
        .filter(Alert.farm_id == farm_id)
        .order_by(Alert.created_at.desc(), Alert.id.desc())
        .all()
    )

    results = []

    for record in records:
        results.append(
            AlertItem(
                id=record.id,
                farm_id=record.farm_id,
                severity=record.severity or "",
                alert_type=record.alert_type or "",
                title=_read_translation_json(
                    record.title_json,
                    "title",
                ),
                explanation=_read_translation_json(
                    record.explanation_json,
                    "explanation",
                ),
                suggested_action=_read_translation_json(
                    record.suggested_action_json,
                    "suggested_action",
                ),
                data_source=record.data_source or "",
                date_generated=record.date_generated or "",
                is_read=bool(record.is_read),
            )
        )

    return results
