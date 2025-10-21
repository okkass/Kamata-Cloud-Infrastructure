```mermaid

erDiagram
users {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    varchar(256) email
    datetime created_at
    boolean is_admin
    datetime last_login_at
}

backups {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    text description
    datetime created_at
    int size
    bigint virtual_storage_id FK
}

virtual_storages ||--o{ backups : "has many"

attached_storages {
    bigint id PK
    bigint virtual_storage_id FK
    varchar(255) path
}

virtual_storages ||--o{ attached_storages : "has many"

images {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    text description
    datetime created_at
    int size
}

instance_types {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    int cpu_core
    int memory_size
    datetime created_at
}

middlewares {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    datetime created_at
}

network_interfaces {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    varchar(15) ip_address
    varchar(15) mac_address
    bigint subnet_id FK
    bigint virtual_machine_id FK
}

physical_nodes {
    bigint id PK
    binary(16) uuid
    datetime created_at
    varchar(256) name
    varchar(15) ip_address
    boolean is_admin
}

portfolios {
    bigint id PK
    binary(16) uuid
}

portfolio_articles {
    bigint id PK
    binary(16) uuid
    varchar(256) title
}

security_groups {
    bigint id PK
    binary(16) uuid
    text description
    datetime created_at
}

security_rules {
    bigint id PK
    bigint security_group_id FK
    binary(16) uuid
    varchar(256) name
    enum('inbound', 'outbound') rule_type
    int port
    enum('tcp', 'udp', 'icmp', 'any') protcol
    varchar(15) target_ip
    enum('allow', 'deny') action
    datetime
}

snapshots {
    bigint id PK
    binary(16) uuid
    text description
    datetime created_at
    bigint target_virtual_machine_id
}

storage_pools {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    enum('local', 'network') type
    datetime created_at
    bigint total_size
}

subnets {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    varchar(15) cidr
    datetime created_at
}

subnets ||--o{ network_interfaces : "belongs to"

virtual_machines {
    bigint id PK
    binary(16) uuid
    bigint instance_type_id FK
    enum('running', 'stoped', 'suspended') status
    bigint physical_node_id FK
    datetime created_at
}

virtual_machine_attached_storage {
    bigint virtual_machine_id FK PK
    bigint virtual_storage_id FK PK
}

virtual_machine_attached_nic {
    bigint virtual_machine_id FK PK
    bigint network_interface_id FK PK
}

virtual_machines ||--o{ network_interfaces : "has"

virtual_networks {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    varchar(15) cidr
    datetime created_at

}

virtual_storages {
    bigint id PK
    binary(16) uuid
    varchar(256) name
    bigint size
    bigint storage_pool_id
}

```
