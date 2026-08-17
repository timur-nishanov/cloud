# Иконки сервисов — TODO: скачать из Figma

Файл: https://www.figma.com/design/hSsvJ58i9BQPwmZlZUnBuv/Yandex-Scale-2026
Секция: node 2011-5500. Экспортировать ПОШТУЧНО (не всю секцию), format svg,
сохранять сюда с именами из колонки «Файл».

Статус: скачивание из этой среды заблокировано — (1) egress-прокси не
пускает к www.figma.com (403 policy), (2) исчерпан лимит вызовов Figma MCP
для View-seat. Прототип показывает текстовые плитки (фолбэк по CLAUDE.md)
и автоматически подхватит иконки, когда файлы появятся в этой папке.

| Файл                | Сервис в игре | Node ID   | Имя фрейма в Figma |
|---------------------|---------------|-----------|--------------------|
| postgresql.svg      | PostgreSQL    | 2007:3528 | PostgreSQL_640x640 (НЕ Sharded) |
| mysql.svg           | MySQL         | 2007:3556 | Yandex Managed Service for MySQL_640x640 |
| clickhouse.svg      | ClickHouse    | 2007:3536 | ClickHouse_640х640 (кириллическая «х» в имени!) |
| storedoc.svg        | StoreDoc      | 2007:3564 | Yandex StoreDoc_640x640 |
| valkey.svg          | Valkey        | 2007:3560 | Yandex Managed Service for Valkey_640x640 |
| kafka.svg           | Kafka         | 2007:3568 | Yandex Managed Service for Apache Kafka_640x640 |
| greenplum.svg       | Greenplum     | 2007:3596 | ВНИМАНИЕ: фрейм ошибочно назван «Yandex Resource Manager_640x640», но карточка подписана «Yandex MPP Analytics Engine for PostgreSQL». Перед сохранением сверить визуально с настоящим Resource Manager (2007:3458) |
| opensearch.svg      | OpenSearch    | 2007:3572 | Yandex Managed Service for OpenSearch_640x640 |
| airflow.svg         | Airflow       | 2007:3592 | Yandex Managed Service for Apache Airflow_640x640 |
| spark.svg           | Spark         | 2007:3584 | Yandex Managed Service for Apache Spark_640x640 |
| ytsaurus.svg        | YTsaurus      | 2007:3588 | Managed Service for YTsaurus_640x640 |
| ydb.svg             | YDB           | 2007:3544 | Yandex Managed Service for YDB_640x640 |
| datalens.svg        | DataLens      | 2007:3552 | Yandex DataLens_640x640 |

Иконки флэт, чёрные, монохром (проверено визуально по PostgreSQL).
Не перекрашивать и не обрезать (правило из CLAUDE.md).
