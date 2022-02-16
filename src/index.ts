export const myPackage = (taco = ''): string => `${taco} from my package`;
import _ from 'lodash';

export class SpannerQuery {
  clauses: Clause[] = [];

  toSql(): string {
    return _.map(this.clauses, clause => clause.toSql()).join('\n');
  }

  pushClause(clause: Clause): void {
    this.clauses.push(clause);
  }

  select(columns: string, tableName: string): SpannerQuery {
    this.pushClause(new Select(columns, tableName));
    return this;
  }

  forceIndex(indexName: string): SpannerQuery {
    this.pushClause(new ForceIndex(indexName));
    return this;
  }

  where(kvPairs: WhereObject): SpannerQuery {
    this.pushClause(new Where(kvPairs));
    return this;
  }

  not(): SpannerQuery {
    this.pushClause(new Not());
    return this;
  }

  order(
    orderColumn: string | string[],
    direction: OrderDirection = 'ASC'
  ): SpannerQuery {
    this.pushClause(new Order(orderColumn, direction));
    return this;
  }
}

abstract class Clause {
  abstract toSql(): string;
}

class Select extends Clause {
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

class ForceIndex extends Clause {
  indexName: string;

  constructor(indexName: string) {
    super();

    this.indexName = indexName;
  }

  toSql(): string {
    return `@{FORCE_INDEX="${this.indexName}"}`;
  }
}

class Where extends Clause {
  kvPairs: WhereObject;

  constructor(kvPairs: WhereObject) {
    super();

    this.kvPairs = kvPairs;
  }

  toSql(): string {
    const pairs = _.toPairs(this.kvPairs);
    return _.map(pairs, ([column, value], idx) => {
      const keyword = idx === 0 ? 'WHERE' : 'AND';
      return `${keyword} ${column} = '${value as string}'`;
    }).join('\n');
  }
}

class Not extends Clause {
  toSql(): string {
    return 'NOT';
  }
}

class Order extends Clause {
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

type WhereObject = Record<string, WhereValue>;
type WhereValue = string | number | null;

type OrderDirection = 'ASC' | 'DESC';
