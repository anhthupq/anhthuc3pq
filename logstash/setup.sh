#systemctl restart elasticsearch

curl -x "" -X DELETE "localhost:9200/multimedia?pretty"
curl -x "" -X PUT "localhost:9200/multimedia?pretty" -H 'Content-Type: application/json' -d'
{
    "settings": {
        "analysis": {
            "analyzer": {
                "standard_asciifolding": {
                    "tokenizer": "standard",
                    "filter": [
                        "asciifolding",
                        "lowercase",
                        "trim"
                    ]
                }
            }
        }
    },
    "mappings": {
        "properties": {
            "doc": {
                "type": "nested",
                "properties": {
                    "TÊN": {
                        "type": "text",
                        "analyzer": "standard_asciifolding"
                    },
                    "THỂ LOẠI": {
                        "type": "text",
                        "analyzer": "standard_asciifolding"
                    },
                    "ĐẠO DIỄN": {
                        "type": "text",
                        "analyzer": "standard_asciifolding"
                    },
                    "KỊCH BẢN": {
                        "type": "text",
                        "analyzer": "standard_asciifolding"
                    },
                    "BIÊN TẬP": {
                        "type": "text",
                        "analyzer": "standard_asciifolding"
                    }
                }
            }
        }
    }
}
'


/usr/share/logstash/bin/logstash -f db2es.conf
