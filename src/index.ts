import _ from 'lodash';
import {
  Clause,
  Select,
  ForceIndex,
  Where,
  Join,
  Limit,
  Order,
  OrderDirection,
  WhereObject,
} from './Clauses';

class NotableQuery {
  spannerQuery: SpannerQuery;
  constructor(spannerQuery: SpannerQuery) {
    this.spannerQuery = spannerQuery;
  }

  where(kvPairs: WhereObject): SpannerQuery {
    this.spannerQuery.pushClause(new Where(kvPairs, true));
    return this.spannerQuery;
  }
}

export class SpannerQuery {
  clauses: Clause[] = [];
  notableQuery = new NotableQuery(this);

  toSql(): string {
    return _.map(this.clauses, (clause) => clause.toSql())
      .join('\n')
      .concat(';');
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

  join(joinTableName: string, onClause: string): SpannerQuery {
    this.pushClause(new Join(joinTableName, onClause));
    return this;
  }

  where(kvPairs: WhereObject): SpannerQuery {
    this.pushClause(new Where(kvPairs));
    return this;
  }

  not(): NotableQuery {
    return this.notableQuery;
  }

  limit(limitNum: number): SpannerQuery {
    this.pushClause(new Limit(limitNum));
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
