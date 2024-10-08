# import json
from typing import Iterator

import nntp

from server.schemas import Channel, ChannelSummary, Card, NewCard, Metadata

DEFAULT_NEWSGROUPS = {
    ("control.cancel", "Cancel messages (no posting)"),
    ("control.checkgroups", "Hierarchy check control messages (no posting)"),
    ("control.newgroup", "Newsgroup creation control messages (no posting)"),
    ("control.rmgroup", "Newsgroup removal control messages (no posting)"),
    ("control", "Various control messages (no posting)"),
    ("junk", "Unfiled articles (no posting)"),
    ("local.general", "Local general group"),
    ("local.test", "Local test group"),
}


def getClient():
    client = nntp.NNTPClient("localhost")
    return client


def channels() -> Iterator[Channel]:
    client = getClient()
    for name, description in set(client.list_newsgroups()) - DEFAULT_NEWSGROUPS:
        yield Channel(name=name, description=description)


def channelSummary(channelName: str) -> ChannelSummary:
    client = getClient()
    estTotal, first, last, name = client.group(channelName)
    return ChannelSummary(
        name=name, estimatedTotalArticles=estTotal, firstArticle=first, lastArticle=last
    )


def _to_metadata(x):
    try:
        return Metadata.model_validate_json(x)
    except Exception:
        return x


def channelCards(channelName: str, start: int, end: int) -> list[Card]:
    client = getClient()
    _, first, last, _ = client.group(channelName)
    if end > last:
        end = last
    return [
        Card(
            number=x[0], headers=x[1], subject=x[1]["Subject"], body=_to_metadata(x[2])
        )
        for x in [client.article(i) for i in range(start, end + 1)]
    ]


def createPost(card: NewCard):
    client = getClient()
    headers = {
        "Subject": card.subject,
        "From": "OERCommons <admin@oercommons.org>",
        "Newsgroups": ",".join(card.channels),
    }
    t = card.body.model_dump_json()
    return client.post(headers=headers, body=t)


def importPost(channelName: str, cardId: int) -> bool:
    return True
