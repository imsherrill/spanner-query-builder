import _ from 'lodash';

export abstract class Clause {
  abstract toSql(): string;
}

export abstract class Notable {
  abstract not: boolean;
}

export class Select extends Clause {
  tableName: string;
  columns: string;

  constructor(columns: string, tableName: string) {
    super();

    this.tableName = tableName;
    this.columns = columns;
  }

  toSql(): string {
    return `SELECT ${this.columns} FROM ${this.tableName}`;
  }
}

export class Delete extends Clause {
  tableName: string;

  constructor(tableName: string) {
    super();

    this.tableName = tableName;
  }

  toSql(): string {
    return `DELETE FROM ${this.tableName}`;
  }
}

export class ForceIndex extends Clause {
  indexName: string;

  constructor(indexName: string) {
    super();

    this.indexName = indexName;
  }

  toSql(): string {
    return `@{FORCE_INDEX="${this.indexName}"}`;
  }
}

export class Where extends Clause implements Notable {
  kvPairs: WhereObject;
  not: boolean;

  constructor(kvPairs: WhereObject, not = false) {
    super();

    this.not = not;
    this.kvPairs = kvPairs;
  }

  toSql(): string {
    const pairs = _.toPairs(this.kvPairs);
    const operation = this.not ? '!=' : '=';
    return _.map(pairs, ([column, value], idx) => {
      const keyword = idx === 0 ? 'WHERE' : 'AND';
      return `${keyword} ${column} ${operation} '${value as string}'`;
    }).join('\n');
  }
}

export class Order extends Clause {
  orderColumn: string | string[];
  direction: OrderDirection;

  constructor(
    orderColumn: string | string[],
    direction: OrderDirection = 'ASC'
  ) {
    super();

    this.orderColumn = orderColumn;
    this.direction = direction;
  }

  toSql(): string {
    const orderCols = this.orderColumn;
    let orderExpression: string;
    if (Array.isArray(orderCols)) {
      orderExpression = orderCols.join(', ');
    } else {
      orderExpression = orderCols;
    }

    return `ORDER BY ${orderExpression} ${this.direction}`;
  }
}

export class Join extends Clause {
  joinTableName: string;
  onClause: string;

  constructor(joinTableName: string, onClause: string) {
    super();

    this.joinTableName = joinTableName;
    this.onClause = onClause;
  }

  toSql(): string {
    return `JOIN ${this.joinTableName} ON ${this.onClause}`;
  }
}

export class Limit extends Clause {
  limit: number;

  constructor(limit: number) {
    super();

    this.limit = limit;
  }

  toSql(): string {
    return `LIMIT ${this.limit}`;
  }
}

export type WhereObject = Record<string, WhereValue>;
type WhereValue = string | number | null;

export type OrderDirection = 'ASC' | 'DESC';
